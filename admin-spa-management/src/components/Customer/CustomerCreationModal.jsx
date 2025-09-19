// filepath: src/components/Appointment/CreateAppointmentModal.jsx
import React, { useMemo, useState } from 'react';
import { appointmentsApi } from '@/services/appointmentsApi';

const CreateAppointmentModal = ({
  isOpen,
  onClose,
  onAppointmentCreated,
  services = [],
  customers = [],
  context
}) => {
  const [form, setForm] = useState({
    leadId: null,
    customerId: null,
    serviceId: '',
    startAt: '',
    endAt: '',
    status: 'SCHEDULED',
    notes: '',
    technicianId: '',
    receptionistId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useMemo(() => {
    if (context?.leadId) {
      setForm(f => ({ ...f, leadId: context.leadId, customerId: null }));
    }
  }, [context]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectCustomer = (e) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setForm(prev => ({ ...prev, customerId: val, leadId: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!form.leadId && !form.customerId) {
      setErr('Vui lòng chọn Lead hoặc Khách hàng.');
      return;
    }
    if (form.leadId && form.customerId) {
      setErr('Chỉ chọn một trong hai: Lead hoặc Khách hàng.');
      return;
    }
    if (!form.serviceId || !form.startAt || !form.endAt || !form.receptionistId) {
      setErr('Vui lòng nhập đủ thông tin.');
      return;
    }

    const body = {
      ...(form.leadId ? { leadId: Number(form.leadId) } : {}),
      ...(form.customerId ? { customerId: Number(form.customerId) } : {}),
      serviceId: Number(form.serviceId),
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      status: form.status,
      notes: form.notes || undefined,
      technicianId: form.technicianId ? Number(form.technicianId) : undefined,
      receptionistId: Number(form.receptionistId)
    };

    try {
      setSubmitting(true);
      await appointmentsApi.createAppointment(body);
      onAppointmentCreated?.();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErr('Không thể tạo lịch hẹn');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Tạo lịch hẹn</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✖</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {err && <p className="rounded bg-rose-50 p-2 text-sm text-rose-700">{err}</p>}
          {!context?.leadId && (
            <div>
              <label className="block text-sm font-medium">Khách hàng</label>
              <select
                name="customerId"
                value={form.customerId || ''}
                onChange={handleSelectCustomer}
                className="mt-1 w-full rounded border px-3 py-2"
              >
                <option value="">-- Chọn khách hàng --</option>
                {customers.map(c => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.fullName || c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Dịch vụ</label>
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            >
              <option value="">-- Chọn dịch vụ --</option>
              {services.map(s => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.name} ({s.basePrice}₫)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Thời gian bắt đầu</label>
              <input type="datetime-local" name="startAt" value={form.startAt} onChange={handleChange} className="mt-1 w-full rounded border px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Thời gian kết thúc</label>
              <input type="datetime-local" name="endAt" value={form.endAt} onChange={handleChange} className="mt-1 w-full rounded border px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Trạng thái</label>
            <select name="status" value={form.status} onChange={handleChange} className="mt-1 w-full rounded border px-3 py-2">
              <option value="SCHEDULED">Đã đặt</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="DONE">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Ghi chú</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="mt-1 w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Receptionist ID</label>
            <input type="number" name="receptionistId" value={form.receptionistId} onChange={handleChange} className="mt-1 w-full rounded border px-3 py-2" required />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={onClose} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">Hủy</button>
            <button type="submit" disabled={submitting} className="rounded bg-pink-600 px-4 py-2 text-white hover:bg-pink-700 disabled:opacity-50">
              {submitting ? 'Đang lưu...' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
