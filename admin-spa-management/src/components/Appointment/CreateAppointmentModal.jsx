import React, { useEffect, useMemo, useState } from "react";
import { appointmentsService } from "@/services";
import { useFormValidation, validationRules } from "@/hooks/useFormValidation";

const CreateAppointmentModal = ({
  isOpen,
  onClose,
  onAppointmentCreated,
  lead = null,
  services = [],
  customers = [],
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ---- Form setup ----
  const initialValues = useMemo(
    () => ({
      customerId: lead?.customerId || "",
      serviceId: "",
      startAt: "",
      endAt: "",
      status: "SCHEDULED",
      notes: lead?.note || "",
    }),
    [lead]
  );

  const rules = {
    customerId: [validationRules.required("Vui lòng chọn khách hàng")],
    serviceId: [validationRules.required("Vui lòng chọn dịch vụ")],
    startAt: [validationRules.required("Vui lòng chọn thời gian bắt đầu")],
    endAt: [validationRules.required("Vui lòng chọn thời gian kết thúc")],
    status: [validationRules.required("Vui lòng chọn trạng thái")],
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    reset,
    setValues,
  } = useFormValidation(initialValues, rules);

  // ---- Helpers ----
  const findService = (idStr) => {
    const id = parseInt(idStr, 10);
    if (!Number.isFinite(id)) return null;
    return services.find((s) => s.serviceId === id) || null;
  };

  const isoLocal = (d) => {
    // format yyyy-MM-ddTHH:mm for datetime-local input
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  // ---- defaulting when modal opens ----
  useEffect(() => {
    if (!isOpen) return;

    const firstService = services[0] || null;
    const defaultServiceId = firstService ? String(firstService.serviceId) : "";

    setValues((prev) => ({
      ...initialValues,
      serviceId: defaultServiceId,
    }));
    setFormError("");
  }, [isOpen, services, initialValues, setValues]);

  // ---- handlers that auto-compute endAt ----
  const handleServiceChange = (serviceIdStr) => {
    const svc = findService(serviceIdStr);

    if (svc && values.startAt) {
      const start = new Date(values.startAt);
      const end = new Date(start.getTime() + (svc.durationMin || 0) * 60000);
      setValues((prev) => ({
        ...prev,
        serviceId: serviceIdStr,
        endAt: isoLocal(end),
      }));
    } else {
      handleChange("serviceId", serviceIdStr);
    }
  };

  const handleStartTimeChange = (startAtStr) => {
    const svc = findService(values.serviceId);
    if (svc) {
      const start = new Date(startAtStr);
      const end = new Date(start.getTime() + (svc.durationMin || 0) * 60000);
      setValues((prev) => ({
        ...prev,
        startAt: startAtStr,
        endAt: isoLocal(end),
      }));
    } else {
      handleChange("startAt", startAtStr);
    }
  };

  // ---- submit ----
  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!validateForm()) {
      setFormError("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        customerId: parseInt(values.customerId, 10),
        serviceId: parseInt(values.serviceId, 10),
        startAt: new Date(values.startAt).toISOString(),
        endAt: new Date(values.endAt).toISOString(),
        status: values.status,
        notes: values.notes?.trim() || "",
      };

      await appointmentsService.create(payload);
      onAppointmentCreated?.();
      // Đóng + reset sau khi tạo thành công
      reset();
      onClose?.();
    } catch (err) {
      console.error("Error creating appointment:", err);
      setFormError("Không thể tạo lịch hẹn. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- close ----
  const handleRequestClose = () => {
    reset();            // muốn giữ giá trị khi mở lại thì có thể bỏ dòng này
    setFormError("");
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3"
      onClick={handleRequestClose} // overlay click => close
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()} // chặn click trong hộp
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Tạo lịch hẹn mới</h2>
          <button
            onClick={handleRequestClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Đóng"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <span className="mt-0.5">⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Customer */}
            <div>
              <label htmlFor="customerId" className="mb-1 block text-sm font-medium text-gray-700">
                Khách hàng <span className="text-red-500">*</span>
              </label>
              <select
                id="customerId"
                value={values.customerId}
                onChange={(e) => handleChange("customerId", e.target.value)}
                onBlur={() => handleBlur("customerId")}
                disabled={submitting}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.customerId && touched.customerId ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Chọn khách hàng</option>
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.fullName} - {c.phone}
                  </option>
                ))}
              </select>
              {errors.customerId && touched.customerId && (
                <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>
              )}
            </div>

            {/* Service */}
            <div>
              <label htmlFor="serviceId" className="mb-1 block text-sm font-medium text-gray-700">
                Dịch vụ <span className="text-red-500">*</span>
              </label>
              <select
                id="serviceId"
                value={values.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                onBlur={() => handleBlur("serviceId")}
                disabled={submitting || services.length === 0}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.serviceId && touched.serviceId ? "border-red-300" : "border-gray-300"
                }`}
              >
                {services.length === 0 ? (
                  <option value="">Không có dịch vụ</option>
                ) : (
                  <>
                    {services.map((s) => (
                      <option key={s.serviceId} value={s.serviceId}>
                        {s.name} — {s.durationMin} phút
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.serviceId && touched.serviceId && (
                <p className="mt-1 text-xs text-red-600">{errors.serviceId}</p>
              )}
            </div>

            {/* Start */}
            <div>
              <label htmlFor="startAt" className="mb-1 block text-sm font-medium text-gray-700">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="startAt"
                value={values.startAt}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                onBlur={() => handleBlur("startAt")}
                disabled={submitting}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.startAt && touched.startAt ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.startAt && touched.startAt && (
                <p className="mt-1 text-xs text-red-600">{errors.startAt}</p>
              )}
            </div>

            {/* End */}
            <div>
              <label htmlFor="endAt" className="mb-1 block text-sm font-medium text-gray-700">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="endAt"
                value={values.endAt}
                onChange={(e) => handleChange("endAt", e.target.value)}
                onBlur={() => handleBlur("endAt")}
                disabled={submitting}
                min={values.startAt || new Date().toISOString().slice(0, 16)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.endAt && touched.endAt ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.endAt && touched.endAt && (
                <p className="mt-1 text-xs text-red-600">{errors.endAt}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={values.status}
                onChange={(e) => handleChange("status", e.target.value)}
                onBlur={() => handleBlur("status")}
                disabled={submitting}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.status && touched.status ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="SCHEDULED">Đã đặt</option>
                <option value="CONFIRMED">Đã xác nhận</option>
              </select>
              {errors.status && touched.status && (
                <p className="mt-1 text-xs text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Notes (full width) */}
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
                Ghi chú
              </label>
              <textarea
                id="notes"
                rows={3}
                value={values.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                disabled={submitting}
                placeholder="Nhập ghi chú cho lịch hẹn..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={handleRequestClose}
            disabled={submitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !isValid}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
          >
            {submitting ? "Đang tạo..." : "Tạo lịch hẹn"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
