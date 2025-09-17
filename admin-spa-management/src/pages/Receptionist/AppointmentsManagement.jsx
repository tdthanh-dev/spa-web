// filepath: admin-spa-management/src/pages/appointments/AppointmentsManagement.jsx
import React from 'react';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { Pagination, SortableHeader } from '@/components/common/CommonComponents';
import CreateAppointmentModal from '@/components/Appointment/CreateAppointmentModal';
import { useAppointmentsManagement } from '@/hooks/useAppointmentsManagement';

const AppointmentsManagement = () => {
  const {
    data,
    sort,
    pagination,
    modalState,
    services,
    customers,
    fetchData,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleCreateAppointment,
    handleCloseModal,
    handleAppointmentCreated,
    getStatusBadge,
    statistics,
    hasAppointments,
    showPagination
  } = useAppointmentsManagement();

  // Map className (từ hook) -> Tailwind để bảo đảm màu hiển thị
  const statusTw = (cls) => {
    const map = {
      'status-scheduled': 'bg-blue-50 text-blue-700',
      'status-confirmed': 'bg-green-50 text-green-700',
      'status-no-show' : 'bg-gray-100 text-gray-600',
      'status-done'    : 'bg-emerald-50 text-emerald-700',
      'status-cancelled':'bg-rose-50 text-rose-700',
      'status-default' : 'bg-slate-100 text-slate-700'
    };
    return map[cls] || map['status-default'];
  };

  if (data.loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <div className="h-10 w-10 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <h2 className="mb-1 text-lg font-semibold">⚠️ Có lỗi xảy ra</h2>
          <p className="mb-4 text-sm">{data.error}</p>
          <button
            className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black"
            onClick={fetchData}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-50"
            onClick={fetchData}
          >
            <span className="text-base">🔄</span> Làm mới
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
            onClick={handleCreateAppointment}
          >
            <span className="text-base">➕</span> Tạo lịch hẹn
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow">
          <div className="text-2xl">📅</div>
          <div>
            <div className="text-sm text-gray-500">Tổng lịch hẹn</div>
            <div className="text-xl font-semibold text-gray-900">{statistics.total}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow">
          <div className="text-2xl">⏰</div>
          <div>
            <div className="text-sm text-gray-500">Đã đặt</div>
            <div className="text-xl font-semibold text-gray-900">{statistics.scheduled}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow">
          <div className="text-2xl">✅</div>
          <div>
            <div className="text-sm text-gray-500">Đã xác nhận</div>
            <div className="text-xl font-semibold text-gray-900">{statistics.confirmed}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow">
          <div className="text-2xl">🎉</div>
          <div>
            <div className="text-sm text-gray-500">Hoàn thành</div>
            <div className="text-xl font-semibold text-gray-900">{statistics.done}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white p-4 shadow">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Danh sách lịch hẹn ({data.appointments.length})
          </h2>
          <div className="text-sm text-gray-600">
            {data.appointments.length} / {data.totalElements} lịch hẹn
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">STT</th>
                {/* SortableHeader nên tự render <th/>, đừng bọc thêm <th> để tránh lỗi <th> lồng <th> */}
                <SortableHeader
                  label="Khách hàng"
                  sortKey="customerId"
                  currentSort={sort}
                  onSort={handleSort}
                  className="px-4 py-3 font-semibold text-gray-700"
                />
                <SortableHeader
                  label="Dịch vụ"
                  sortKey="serviceId"
                  currentSort={sort}
                  onSort={handleSort}
                  className="px-4 py-3 font-semibold text-gray-700"
                />
                <SortableHeader
                  label="Thời gian bắt đầu"
                  sortKey="startAt"
                  currentSort={sort}
                  onSort={handleSort}
                  className="px-4 py-3 font-semibold text-gray-700"
                />
                <SortableHeader
                  label="Thời gian kết thúc"
                  sortKey="endAt"
                  currentSort={sort}
                  onSort={handleSort}
                  className="px-4 py-3 font-semibold text-gray-700"
                />
                <SortableHeader
                  label="Trạng thái"
                  sortKey="status"
                  currentSort={sort}
                  onSort={handleSort}
                  className="px-4 py-3 font-semibold text-gray-700"
                />
                <th className="px-4 py-3 font-semibold text-gray-700">Ghi chú</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {hasAppointments ? (
                data.appointments.map((appointment, index) => {
                  const statusInfo = getStatusBadge(appointment.status);
                  return (
                    <tr key={appointment.appointmentId} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {pagination.page * pagination.size + index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {appointment.customer?.fullName || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {appointment.service?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {appointment.startAt ? (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {formatDateTimeVN(appointment.startAt)}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {appointment.endAt ? (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            {formatDateTimeVN(appointment.endAt)}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            statusTw(statusInfo.className)
                          ].join(' ')}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {appointment.notes || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>
                          <button
                            className="rounded-md bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700"
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="rounded-md bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-700"
                            title="Hủy lịch hẹn"
                          >
                            ❌
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="mb-2 text-3xl">📅</div>
                      <p>Chưa có lịch hẹn nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="mt-4">
            <Pagination
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              pageSize={data.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              disabled={data.loading}
            />
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onAppointmentCreated={handleAppointmentCreated}
        services={services}
        customers={customers}
      />
    </div>
  );
};

export default AppointmentsManagement;
