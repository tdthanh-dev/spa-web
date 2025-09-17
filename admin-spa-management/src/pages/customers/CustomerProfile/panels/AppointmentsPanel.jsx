import React from 'react';

export default function AppointmentsPanel({
  loading,
  appointments,
  formatDateTimeVN,
  getStatusBadge
}) {
  if (loading) {
    return <div className="text-gray-500">Đang tải...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Lịch hẹn</h3>
          <button className="rounded-lg bg-pink-600 px-3 py-2 text-white hover:bg-pink-700">
            📅 Tạo lịch hẹn
          </button>
        </div>
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <div className="mb-2 text-3xl">📅</div>
          <p className="text-gray-600">Chưa có lịch hẹn nào</p>
          <button className="mt-3 rounded-lg bg-pink-600 px-3 py-2 text-white hover:bg-pink-700">
            Tạo lịch hẹn đầu tiên
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Lịch hẹn</h3>
        <button className="rounded-lg bg-pink-600 px-3 py-2 text-white hover:bg-pink-700">
          📅 Tạo lịch hẹn
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {appointments.map((a) => (
          <div key={a.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">{a.serviceName}</h4>
              <span className="text-sm text-gray-600">{a.technician}</span>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <strong>Ngày:</strong> {formatDateTimeVN(a.date)}
              </p>
              <p>
                <strong>Giờ:</strong> {a.time}
              </p>
              <p>
                <strong>Ghi chú:</strong> {a.notes}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}