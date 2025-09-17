import React from "react";

/**
 * Cho phép truyền getStatusBadge theo 2 kiểu:
 * 1) Trả về ReactNode: render thẳng
 * 2) Trả về object { text, className }: tự wrap thành badge
 */
function renderStatusBadge(getStatusBadge, type, status) {
  if (typeof getStatusBadge !== "function") return null;
  const out = getStatusBadge(type, status);
  if (!out) return null;

  // Nếu là React element -> trả nguyên
  if (React.isValidElement(out)) return out;

  // Nếu là object { text, className }
  if (typeof out === "object") {
    const { text, className } = out;
    const safeText = text ?? String(status ?? "");
    const safeClass =
      className ??
      "bg-gray-100 text-gray-800"; // fallback
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${safeClass}`}>
        {safeText}
      </span>
    );
  }

  // Nếu là string -> bọc badge mặc định
  if (typeof out === "string") {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
        {out}
      </span>
    );
  }

  return null;
}

export default function FinancialPanel({
  loading,
  items = [],
  onCreateInvoice,
  formatDateTimeVN,
  formatCurrency,
  getStatusBadge,
}) {
  if (loading) {
    return <div className="text-gray-500">Đang tải...</div>;
  }

  if (!items.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h3>
          <button
            type="button"
            onClick={onCreateInvoice}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
          >
            ➕ Tạo hóa đơn
          </button>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <div className="mb-2 text-3xl">💰</div>
          <p className="text-gray-600">Chưa có giao dịch nào</p>
          <button
            type="button"
            onClick={onCreateInvoice}
            className="mt-3 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
          >
            Tạo hóa đơn đầu tiên
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h3>
        <button
          type="button"
          onClick={onCreateInvoice}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
        >
          ➕ Tạo hóa đơn
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.map((tr) => {
          const isInvoice = tr?.type === "INVOICE";
          const amountPrefix = isInvoice ? "-" : "+";
          const amountClass = isInvoice ? "text-red-600" : "text-emerald-600";

          return (
            <div
              key={tr?.id ?? `${tr?.type}-${tr?.date}-${tr?.amount}`}
              className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg">{isInvoice ? "📄" : "💳"}</span>
                  <h4 className="truncate font-semibold text-gray-900">
                    {tr?.description || (isInvoice ? "Hóa đơn" : "Thanh toán")}
                  </h4>
                  {renderStatusBadge(getStatusBadge, tr?.type, tr?.status)}
                </div>

                <p className="text-sm text-gray-600">
                  <strong>Ngày:</strong>{" "}
                  {typeof formatDateTimeVN === "function"
                    ? formatDateTimeVN(tr?.date)
                    : tr?.date || "—"}
                </p>

                {!!tr?.pointsEarned && (
                  <p className="text-sm text-gray-600">
                    <strong>Điểm được:</strong> +{tr.pointsEarned} điểm
                  </p>
                )}
              </div>

              <div className={`ml-4 whitespace-nowrap text-right text-base font-semibold ${amountClass}`}>
                {amountPrefix}
                {typeof formatCurrency === "function" ? formatCurrency(tr?.amount) : tr?.amount ?? 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
