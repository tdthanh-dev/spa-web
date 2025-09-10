// filepath: admin-spa-management/src/pages/dashboards/ReceptionistDashboard.jsx

import React, { useState, useEffect } from 'react';
import { spaCustomersAPI, appointmentsAPI, leadsAPI, API_BASE_URL } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { getAccessToken } from '@/utils/auth';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import './ReceptionistDashboard.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

/**
 * Receptionist Dashboard - Overview for reception staff
 * Shows daily operations, pending requests, and quick customer actions
 */
const ReceptionistDashboard = ({ user }) => {
  const [data, setData] = useState({
    todayAppointments: [],
    pendingRequests: [],
    recentCustomers: [],
    stats: null,
    appointmentStatusChart: [],
    appointmentTrendChart: [],
    servicePopularityChart: [],
    customerTiersChart: [],
    loading: true,
    error: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all data in parallel
      const [
        appointmentsRes,
        requestsRes,
        customersRes,
        statsRes,
        appointmentStatusRes,
        appointmentTrendRes,
        servicePopularityRes,
        customerTiersRes
      ] = await Promise.all([
        appointmentsAPI.getTodayAppointments(),
        leadsAPI.getAll(0, 10, 'leadId', 'desc'),
        spaCustomersAPI.getAll(0, 5),
        fetch(`${API_BASE_URL}/dashboard/receptionist/stats`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/dashboard/charts/appointment-status`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/dashboard/charts/appointment-trend`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/dashboard/charts/service-popularity`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/dashboard/charts/customer-tiers`, {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Debug responses
      console.log('🔍 Appointments Response:', appointmentsRes);
      console.log('🔍 Requests Response:', requestsRes);
      console.log('🔍 Customers Response:', customersRes);

      // Handle axios responses (with .data structure)
      const appointments = appointmentsRes.data || [];
      const requests = requestsRes.data?.content || requestsRes.data || [];
      const customers = customersRes.data?.content || customersRes.data || [];

      console.log('📊 Processed data:', {
        appointments: appointments.length,
        requests: requests.length,
        customers: customers.length
      });

      // Handle fetch responses (direct JSON)
      const stats = statsRes.ok ? await statsRes.json() : null;
      const appointmentStatusChart = appointmentStatusRes.ok ? await appointmentStatusRes.json() : [];
      const appointmentTrendChart = appointmentTrendRes.ok ? await appointmentTrendRes.json() : [];
      const servicePopularityChart = servicePopularityRes.ok ? await servicePopularityRes.json() : [];
      const customerTiersChart = customerTiersRes.ok ? await customerTiersRes.json() : [];

      console.log('📈 Dashboard data:', {
        stats,
        appointmentStatusChart: appointmentStatusChart.length,
        appointmentTrendChart: appointmentTrendChart.length,
        servicePopularityChart: servicePopularityChart.length,
        customerTiersChart: customerTiersChart.length
      });

      setData({
        todayAppointments: Array.isArray(appointments) ? appointments : [],
        pendingRequests: Array.isArray(requests) ? requests.filter(req => req.status === 'NEW') : [],
        recentCustomers: Array.isArray(customers) ? customers : [],
        stats: stats,
        appointmentStatusChart: Array.isArray(appointmentStatusChart) ? appointmentStatusChart : [],
        appointmentTrendChart: Array.isArray(appointmentTrendChart) ? appointmentTrendChart : [],
        servicePopularityChart: Array.isArray(servicePopularityChart) ? servicePopularityChart : [],
        customerTiersChart: Array.isArray(customerTiersChart) ? customerTiersChart : [],
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('❌ Error fetching receptionist dashboard data:', error);
      setData(prev => ({
        ...prev,
        todayAppointments: [],
        pendingRequests: [],
        recentCustomers: [],
        stats: null,
        appointmentStatusChart: [],
        appointmentTrendChart: [],
        servicePopularityChart: [],
        customerTiersChart: [],
        loading: false,
        error: 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.'
      }));
    }
  };

  const handleCustomerSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const response = await spaCustomersAPI.search(searchTerm);
      if (response.data?.success) {
        setSearchResults(response.data.data.content || []);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const getAppointmentStatusStyle = (status) => {
    const styles = {
      SCHEDULED: { background: '#dbeafe', color: '#1e40af' },
      CONFIRMED: { background: '#dcfce7', color: '#166534' },
      CHECKED_IN: { background: '#fef3c7', color: '#92400e' },
      IN_PROGRESS: { background: '#e0e7ff', color: '#5b21b6' }
    };
    return styles[status] || styles.SCHEDULED;
  };

  if (data.loading) {
    return (
      <div className="receptionist-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="receptionist-dashboard">
      <div className="dashboard-header">
        <h1>🛎️ Receptionist Dashboard</h1>
        <p>Quản lý hoạt động hàng ngày và hỗ trợ khách hàng</p>
      </div>

      {/* Enhanced Daily Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{data.stats?.todayAppointments || data.todayAppointments.length}</div>
          <div className="stat-label">Lịch hẹn hôm nay</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data.stats?.pendingRequests || data.pendingRequests.length}</div>
          <div className="stat-label">Yêu cầu chờ xử lý</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {data.stats?.todayCompleted || data.todayAppointments.filter(apt => apt.status === 'COMPLETED').length}
          </div>
          <div className="stat-label">Hoàn thành</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {data.stats?.weekRevenue ? `${(data.stats.weekRevenue / 1000000).toFixed(1)}M` : '0M'}
          </div>
          <div className="stat-label">Doanh thu tuần</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data.stats?.activeCustomers || 0}</div>
          <div className="stat-label">Khách hàng active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data.stats?.customerRetentionRate ? `${data.stats.customerRetentionRate}%` : '0%'}</div>
          <div className="stat-label">Tỷ lệ giữ chân KH</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Today Appointments Section */}
        <div className="dashboard-section today-appointments">
          <h2>📅 Lịch hẹn hôm nay ({data.todayAppointments.length})</h2>
          <div className="section-content">
            {data.todayAppointments.length === 0 ? (
              <p>Không có lịch hẹn nào hôm nay</p>
            ) : (
              <div className="appointments-list">
                {data.todayAppointments.map(appointment => {
                  const statusStyle = getAppointmentStatusStyle(appointment.status);
                  return (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-time">{appointment.formattedTime}</div>
                      <div className="appointment-info">
                        <div className="customer-name">{appointment.customerName}</div>
                        <div className="service-name">{appointment.serviceName}</div>
                        <div className="technician-name">{appointment.technicianName || 'Chưa phân công'}</div>
                      </div>
                      <div className="appointment-status">
                        <span 
                          className="status-badge"
                          style={{
                            background: statusStyle.background,
                            color: statusStyle.color
                          }}
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
        </div>

        {/* Pending Requests Section */}
        <div className="dashboard-section pending-requests">
          <h2>📞 Yêu cầu tư vấn chờ xử lý ({data.pendingRequests.length})</h2>
          <div className="section-content">
            {data.pendingRequests.length === 0 ? (
              <p>Không có yêu cầu nào chờ xử lý</p>
            ) : (
              <div className="requests-list">
                                 {data.pendingRequests.map(request => (
                   <div key={request.leadId} className="request-card">
                     <div className="request-info">
                       <div className="customer-name">{request.fullName}</div>
                       <div className="customer-phone">{request.phone}</div>
                       <div className="customer-note">{request.note}</div>
                       <div className="customer-type">
                         <span className={`customer-type-badge ${request.customerId ? 'existing' : 'new'}`}>
                           {request.customerId ? 'Khách cũ' : 'Khách mới'}
                         </span>
                       </div>
                     </div>
                                           <div className="request-time">
                        {request.createdAt ? formatDateTimeVN(request.createdAt) : 'N/A'}
                      </div>
                     <button className="process-btn">Xử lý</button>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Search Section */}
        <div className="dashboard-section customer-search">
          <h2>🔍 Tìm kiếm khách hàng</h2>
          <div className="section-content">
            <form onSubmit={handleCustomerSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">🔍</button>
              </div>
            </form>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                <h4>Kết quả tìm kiếm:</h4>
                {searchResults.map(customer => (
                  <div key={customer.id} className="customer-result">
                    <div className="customer-info">
                      <div className="name">{customer.fullName}</div>
                      <div className="contact">{customer.phone} - {customer.email}</div>
                    </div>
                    <button className="view-btn">Xem</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="dashboard-section quick-actions">
          <h2>⚡ Thao tác nhanh</h2>
          <div className="section-content">
            <div className="action-buttons">
              <button 
                className="action-btn primary"
                onClick={() => window.location.href = '/receptionist/customers'}
              >
                👤 Đăng ký khách mới
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => window.location.href = '/receptionist/appointments'}
              >
                📅 Đặt lịch hẹn
              </button>
              <button 
                className="action-btn accent"
                onClick={() => window.location.href = '/receptionist/consultation'}
              >
                💬 Xử lý yêu cầu tư vấn
              </button>
              <button className="action-btn neutral">
                📞 Gọi điện check-in
              </button>
            </div>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="dashboard-section recent-customers">
          <h2>👥 Khách hàng mới ({data.recentCustomers.length})</h2>
          <div className="section-content">
            {data.recentCustomers.length === 0 ? (
              <p>Chưa có khách hàng mới</p>
            ) : (
              <div className="customers-list">
                {data.recentCustomers.map(customer => (
                  <div key={customer.id} className="customer-item">
                    <div className="customer-info">
                      <div className="customer-name">{customer.fullName}</div>
                      <div className="customer-contact">{customer.phone}</div>
                    </div>
                    <div className="customer-date">
                      {formatDateTimeVN(customer.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        {data.appointmentStatusChart.length > 0 && (
          <div className="dashboard-section chart-section">
            <h2>📊 Phân bố trạng thái lịch hẹn</h2>
            <div className="section-content">
              <div className="chart-container">
                <Doughnut
                  data={{
                    labels: data.appointmentStatusChart.map(item => item.label),
                    datasets: [{
                      data: data.appointmentStatusChart.map(item => item.count),
                      backgroundColor: data.appointmentStatusChart.map(item => item.color),
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {data.appointmentTrendChart.length > 0 && (
          <div className="dashboard-section chart-section">
            <h2>📈 Xu hướng lịch hẹn 7 ngày</h2>
            <div className="section-content">
              <div className="chart-container">
                <Line
                  data={{
                    labels: data.appointmentTrendChart.map(item => item.label),
                    datasets: [{
                      label: 'Số lịch hẹn',
                      data: data.appointmentTrendChart.map(item => item.count),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4
                    }]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {data.servicePopularityChart.length > 0 && (
          <div className="dashboard-section chart-section">
            <h2>🏆 Dịch vụ phổ biến</h2>
            <div className="section-content">
              <div className="chart-container">
                <Bar
                  data={{
                    labels: data.servicePopularityChart.map(item => item.label),
                    datasets: [{
                      label: 'Số lượt sử dụng',
                      data: data.servicePopularityChart.map(item => item.count),
                      backgroundColor: data.servicePopularityChart.map(item => item.color),
                      borderRadius: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {data.customerTiersChart.length > 0 && (
          <div className="dashboard-section chart-section">
            <h2>👑 Phân loại khách hàng</h2>
            <div className="section-content">
              <div className="chart-container">
                <Doughnut
                  data={{
                    labels: data.customerTiersChart.map(item => item.label),
                    datasets: [{
                      data: data.customerTiersChart.map(item => item.count),
                      backgroundColor: data.customerTiersChart.map(item => item.color),
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Daily Overview */}
        <div className="dashboard-section daily-overview">
          <h2>📊 Tổng quan chi tiết</h2>
          <div className="section-content">
            <div className="overview-stats-grid">
              <div className="overview-item">
                <span className="label">Lịch hẹn hôm nay:</span>
                <span className="value">{data.stats?.todayAppointments || data.todayAppointments.length}</span>
              </div>
              <div className="overview-item">
                <span className="label">Đã check-in:</span>
                <span className="value">{data.stats?.todayCheckIns || 0}</span>
              </div>
              <div className="overview-item">
                <span className="label">Hoàn thành:</span>
                <span className="value">{data.stats?.todayCompleted || 0}</span>
              </div>
              <div className="overview-item">
                <span className="label">Không đến:</span>
                <span className="value">{data.stats?.todayNoShows || 0}</span>
              </div>
              <div className="overview-item">
                <span className="label">Yêu cầu chờ xử lý:</span>
                <span className="value">{data.stats?.pendingRequests || data.pendingRequests.length}</span>
              </div>
              <div className="overview-item">
                <span className="label">Khách hàng mới hôm nay:</span>
                <span className="value">{data.stats?.newCustomersToday || 0}</span>
              </div>
              <div className="overview-item">
                <span className="label">Tổng khách hàng:</span>
                <span className="value">{data.stats?.totalCustomers || 0}</span>
              </div>
              <div className="overview-item">
                <span className="label">Tỷ lệ giữ chân KH:</span>
                <span className="value">{data.stats?.customerRetentionRate ? `${data.stats.customerRetentionRate}%` : '0%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {data.error && (
        <div className="error-banner">
          <span>⚠️ {data.error}</span>
          <button onClick={fetchDashboardData} className="retry-btn">Thử lại</button>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
