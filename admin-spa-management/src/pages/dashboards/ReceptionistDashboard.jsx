// filepath: src/pages/dashboards/ReceptionistDashboard.jsx

import React from 'react';
import { useReceptionistDashboard } from '@/hooks/useReceptionistDashboard';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

/**
 * Receptionist Dashboard - Tailwind UI
 * - Chủ đạo hồng (primary) & chữ đen tuyền (black)
 * - Giữ nguyên logic, thay class CSS bằng Tailwind
 */
const ReceptionistDashboard = () => {
  const {
    data,
    searchTerm,
    searchResults,
    setSearchTerm,
    fetchDashboardData,
    handleCustomerSearch,
    getAppointmentStatusStyle,
  } = useReceptionistDashboard();

  if (data.loading) {
    return (
      <div className="p-6">
        <div className="grid place-items-center py-24">
          <div className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
          <p className="mt-4 text-black-700">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black-900">🛎️ Receptionist Dashboard</h1>
        <p className="text-black-600">Quản lý hoạt động hàng ngày và hỗ trợ khách hàng</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label="Lịch hẹn hôm nay" value={
          data.stats?.todayAppointments ?? (Array.isArray(data.todayAppointments) ? data.todayAppointments.length : 0)
        } />
        <StatCard label="Yêu cầu chờ xử lý" value={
          data.stats?.pendingRequests ?? (Array.isArray(data.pendingRequests) ? data.pendingRequests.length : 0)
        } />
        <StatCard label="Hoàn thành" value={
          data.stats?.todayCompleted ?? (Array.isArray(data.todayAppointments) ? data.todayAppointments.filter(apt => apt.status === 'COMPLETED').length : 0)
        } />
        <StatCard label="Doanh thu tuần" value={
          data.stats?.weekRevenue ? `${(data.stats.weekRevenue / 1_000_000).toFixed(1)}M` : '0M'
        } />
        <StatCard label="Khách hàng active" value={data.stats?.activeCustomers ?? 0} />
        <StatCard label="Tỷ lệ giữ chân KH" value={data.stats?.customerRetentionRate ? `${data.stats.customerRetentionRate}%` : '0%'} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Today Appointments */}
        <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
          <header className="flex items-center justify-between px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
            <h2 className="text-base font-semibold text-black-900">
              📅 Lịch hẹn hôm nay {`(${Array.isArray(data.todayAppointments) ? data.todayAppointments.length : 0})`}
            </h2>
          </header>
          <div className="p-4">
            {Array.isArray(data.todayAppointments) && data.todayAppointments.length === 0 ? (
              <p className="text-black-700">Không có lịch hẹn nào hôm nay</p>
            ) : (
              <div className="space-y-3">
                {Array.isArray(data.todayAppointments) && data.todayAppointments.map((appointment) => {
                  const statusStyle = getAppointmentStatusStyle(appointment.status);
                  return (
                    <div key={appointment.id} className="flex items-center justify-between gap-4 rounded-xl border border-primary-100 bg-white px-4 py-3 shadow-sm hover:shadow transition">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-primary-100 text-primary-700 font-semibold">
                          {appointment.formattedTime || '--:--'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-black-900 font-medium truncate">{appointment.customerName}</div>
                          <div className="text-black-600 text-sm truncate">{appointment.serviceName}</div>
                          <div className="text-black-600 text-xs truncate">{appointment.technicianName || 'Chưa phân công'}</div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span
                           className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border"
                           style={{ background: statusStyle.background, color: statusStyle.color }}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Pending Requests */}
        <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
          <header className="flex items-center justify-between px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
            <h2 className="text-base font-semibold text-black-900">📞 Yêu cầu tư vấn chờ xử lý ({data.pendingRequests.length})</h2>
          </header>
          <div className="p-4">
            {data.pendingRequests.length === 0 ? (
              <p className="text-black-700">Không có yêu cầu nào chờ xử lý</p>
            ) : (
              <div className="space-y-3">
                {data.pendingRequests.map((request) => (
                  <div key={request.leadId} className="flex items-center justify-between gap-4 rounded-xl border border-primary-100 bg-white px-4 py-3 shadow-sm hover:shadow transition">
                    <div className="min-w-0">
                      <div className="text-black-900 font-medium truncate">{request.fullName}</div>
                      <div className="text-black-700 text-sm truncate">{request.phone}</div>
                      <div className="text-black-600 text-sm truncate">{request.note}</div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ` + (request.customerId ? 'bg-primary-50 text-primary-800 border-primary-200' : 'bg-black-100 text-black-800 border-black-200')}>
                          {request.customerId ? 'Khách cũ' : 'Khách mới'}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-black-700 text-sm">{request.createdAt ? formatDateTimeVN(request.createdAt) : 'N/A'}</div>
                      <button className="mt-2 inline-flex items-center rounded-xl bg-primary-500 text-white px-3 py-1.5 text-xs font-medium hover:bg-primary-600">Xử lý</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Customer Search */}
        <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
          <header className="px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
            <h2 className="text-base font-semibold text-black-900">🔍 Tìm kiếm khách hàng</h2>
          </header>
          <div className="p-4">
            <form onSubmit={handleCustomerSearch} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-xl border border-primary-200 bg-white px-3 py-2 text-sm text-black-800 placeholder-black-500/70 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="rounded-xl border border-primary-200 text-black-800 px-3 py-2 hover:bg-primary-50">🔍</button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-black-800 mb-2">Kết quả tìm kiếm:</h4>
                <div className="space-y-2">
                  {searchResults.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between gap-4 rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <div className="text-black-900 font-medium truncate">{customer.fullName}</div>
                        <div className="text-black-600 truncate">{customer.phone} - {customer.email}</div>
                      </div>
                      <button className="shrink-0 inline-flex items-center rounded-xl border border-primary-200 text-black-800 px-3 py-1.5 hover:bg-primary-50">Xem</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
          <header className="px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
            <h2 className="text-base font-semibold text-black-900">⚡ Thao tác nhanh</h2>
          </header>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="rounded-xl bg-primary-500 text-white px-3 py-2 text-sm font-medium hover:bg-primary-600"
                onClick={() => (window.location.href = '/receptionist/customers')}
              >
                👤 Đăng ký khách mới
              </button>
              <button
                className="rounded-xl border border-primary-200 text-black-800 px-3 py-2 text-sm font-medium hover:bg-primary-50"
                onClick={() => (window.location.href = '/receptionist/appointments')}
              >
                📅 Đặt lịch hẹn
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-2 text-sm font-medium hover:opacity-95"
                onClick={() => (window.location.href = '/receptionist/consultation')}
              >
                💬 Xử lý yêu cầu tư vấn
              </button>
              <button className="rounded-xl border border-black-200 text-black-800 px-3 py-2 text-sm font-medium hover:bg-black-50">
                📞 Gọi điện check-in
              </button>
            </div>
          </div>
        </section>

        {/* Recent Customers */}
        <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
          <header className="px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
            <h2 className="text-base font-semibold text-black-900">👥 Khách hàng mới ({data.recentCustomers.length})</h2>
          </header>
          <div className="p-4">
            {data.recentCustomers.length === 0 ? (
              <p className="text-black-700">Chưa có khách hàng mới</p>
            ) : (
              <div className="space-y-2">
                {data.recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between gap-4 rounded-xl border border-primary-100 bg-white px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-black-900 font-medium truncate">{customer.fullName}</div>
                      <div className="text-black-700 text-sm truncate">{customer.phone}</div>
                    </div>
                    <div className="shrink-0 text-black-700 text-sm">{formatDateTimeVN(customer.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Charts */}
        {data.appointmentStatusChart.length > 0 && (
          <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
            <header className="px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
              <h2 className="text-base font-semibold text-black-900">📊 Phân bố trạng thái lịch hẹn</h2>
            </header>
            <div className="p-4">
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: data.appointmentStatusChart.map((item) => item.label),
                    datasets: [
                      {
                        data: data.appointmentStatusChart.map((item) => item.count),
                        backgroundColor: data.appointmentStatusChart.map((item) => item.color),
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>
          </section>
        )}

        {data.appointmentTrendChart.length > 0 && (
          <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
            <header className="px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
              <h2 className="text-base font-semibold text-black-900">📈 Xu hướng lịch hẹn 7 ngày</h2>
            </header>
            <div className="p-4">
              <div className="h-64">
                <Line
                  data={{
                    labels: data.appointmentTrendChart.map((item) => item.label),
                    datasets: [
                      {
                        label: 'Số lịch hẹn',
                        data: data.appointmentTrendChart.map((item) => item.count),
                        borderColor: '#ec4899', // primary-500
                        backgroundColor: 'rgba(236,72,153,0.12)',
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{ responsive: true, scales: { y: { beginAtZero: true } } }}
                />
              </div>
            </div>
          </section>
        )}

        {data.servicePopularityChart.length > 0 && (
          <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
            <header className="px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
              <h2 className="text-base font-semibold text-black-900">🏆 Dịch vụ phổ biến</h2>
            </header>
            <div className="p-4">
              <div className="h-64">
                <Bar
                  data={{
                    labels: data.servicePopularityChart.map((item) => item.label),
                    datasets: [
                      {
                        label: 'Số lượt sử dụng',
                        data: data.servicePopularityChart.map((item) => item.count),
                        backgroundColor: data.servicePopularityChart.map((item) => item.color),
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: { y: { beginAtZero: true } },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {data.customerTiersChart.length > 0 && (
          <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm">
            <header className="px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
              <h2 className="text-base font-semibold text-black-900">👑 Phân loại khách hàng</h2>
            </header>
            <div className="p-4">
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: data.customerTiersChart.map((item) => item.label),
                    datasets: [
                      {
                        data: data.customerTiersChart.map((item) => item.count),
                        backgroundColor: data.customerTiersChart.map((item) => item.color),
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Daily Overview */}
        <section className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur shadow-sm xl:col-span-2">
          <header className="px-4 py-3 border-b border-primary-100 bg-primary-50/70 rounded-t-2xl">
            <h2 className="text-base font-semibold text-black-900">📊 Tổng quan chi tiết</h2>
          </header>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <OverviewItem label="Lịch hẹn hôm nay:" value={
                data.stats?.todayAppointments ?? (Array.isArray(data.todayAppointments) ? data.todayAppointments.length : 0)
              } />
              <OverviewItem label="Đã check-in:" value={data.stats?.todayCheckIns ?? 0} />
              <OverviewItem label="Hoàn thành:" value={data.stats?.todayCompleted ?? 0} />
              <OverviewItem label="Không đến:" value={data.stats?.todayNoShows ?? 0} />
              <OverviewItem label="Yêu cầu chờ xử lý:" value={data.stats?.pendingRequests ?? data.pendingRequests.length} />
              <OverviewItem label="Khách hàng mới hôm nay:" value={data.stats?.newCustomersToday ?? 0} />
              <OverviewItem label="Tổng khách hàng:" value={data.stats?.totalCustomers ?? 0} />
              <OverviewItem label="Tỷ lệ giữ chân KH:" value={data.stats?.customerRetentionRate ? `${data.stats.customerRetentionRate}%` : '0%'} />
            </div>
          </div>
        </section>
      </div>

      {/* Error banner */}
      {data.error && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-error-200 bg-error-50 text-error-700 px-4 py-3">
          <span>⚠️ {data.error}</span>
          <button onClick={fetchDashboardData} className="rounded-xl bg-white text-error-700 border border-error-200 px-3 py-1.5 text-sm hover:bg-error-100">Thử lại</button>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;

/* ---------- Small presentational components (Tailwind) ---------- */
const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-primary-100 bg-white/80 backdrop-blur p-4 shadow-sm hover:shadow transition">
    <div className="text-2xl font-bold text-black-900">{value}</div>
    <div className="text-sm text-black-600">{label}</div>
  </div>
);

const OverviewItem = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-xl border border-primary-100 bg-white px-3 py-2 text-sm">
    <span className="text-black-700">{label}</span>
    <span className="text-black-900 font-semibold">{value}</span>
  </div>
);
