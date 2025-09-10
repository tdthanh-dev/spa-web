// filepath: admin-spa-management/src/pages/dashboards/TechnicianDashboard.jsx

import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import './TechnicianDashboard.css';

/**
 * Technician Dashboard - Overview for technicians
 * Shows personal schedule, treatments in progress, and performance metrics
 */
const TechnicianDashboard = ({ user }) => {
  const [data, setData] = useState({
    todayAppointments: [],
    myAppointments: [],
    currentTreatment: null,
    loading: true,
    error: null
  });

  const technicianId = user?.id; // Get technician ID from user context

  useEffect(() => {
    if (technicianId) {
      fetchDashboardData();
    }
  }, [technicianId]);

  const fetchDashboardData = async () => {
    if (!technicianId) return;

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // For now, get all today appointments since we don't have technician-specific endpoint yet
      const todayAppointmentsRes = await appointmentsAPI.getTodayAppointments();
      const myAppointmentsRes = await appointmentsAPI.getAll(0, 20);

      const allTodayAppointments = todayAppointmentsRes.data?.success ? todayAppointmentsRes.data.data : [];
      const allMyAppointments = myAppointmentsRes.data?.success ? myAppointmentsRes.data.data.content || [] : [];

      // Filter appointments for this technician
      const myTodayAppointments = allTodayAppointments.filter(apt => apt.technicianId === technicianId);
      const myAllAppointments = allMyAppointments.filter(apt => apt.technicianId === technicianId);
      
      // Find current treatment (IN_PROGRESS status)
      const currentTreatment = myTodayAppointments.find(apt => apt.status === 'IN_PROGRESS');

      setData({
        todayAppointments: myTodayAppointments,
        myAppointments: myAllAppointments.slice(0, 10), // Recent 10
        currentTreatment: currentTreatment || null,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching technician dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.'
      }));
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, newStatus);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Có lỗi khi cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      SCHEDULED: { background: '#dbeafe', color: '#1e40af', label: 'Đã đặt' },
      CONFIRMED: { background: '#dcfce7', color: '#166534', label: 'Xác nhận' },
      CHECKED_IN: { background: '#fef3c7', color: '#92400e', label: 'Đã check-in' },
      IN_PROGRESS: { background: '#e0e7ff', color: '#5b21b6', label: 'Đang thực hiện' },
      COMPLETED: { background: '#dcfce7', color: '#166534', label: 'Hoàn thành' }
    };
    return styles[status] || styles.SCHEDULED;
  };

  const getNextAppointment = () => {
    return data.todayAppointments
      .filter(apt => ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'].includes(apt.status))
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];
  };

  if (data.loading) {
    return (
      <div className="technician-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  const nextAppointment = getNextAppointment();

  return (
    <div className="technician-dashboard">
      <div className="dashboard-header">
        <h1>🎨 Technician Dashboard</h1>
        <p>Lịch làm việc cá nhân và quy trình điều trị</p>
      </div>

      {/* Performance Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{data.todayAppointments.length}</div>
          <div className="stat-label">Lịch hẹn hôm nay</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {data.todayAppointments.filter(apt => apt.status === 'COMPLETED').length}
          </div>
          <div className="stat-label">Đã hoàn thành</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {data.currentTreatment ? 1 : 0}
          </div>
          <div className="stat-label">Đang điều trị</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data.myAppointments.length}</div>
          <div className="stat-label">Tổng lịch hẹn</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Current Treatment */}
        {data.currentTreatment && (
          <div className="dashboard-section current-treatment">
            <h2>🩺 Đang điều trị</h2>
            <div className="section-content">
              <div className="treatment-card active">
                <div className="treatment-info">
                  <div className="customer-name">{data.currentTreatment.customerName}</div>
                  <div className="service-name">{data.currentTreatment.serviceName}</div>
                  <div className="treatment-time">
                    Bắt đầu: {data.currentTreatment.formattedTime}
                  </div>
                </div>
                <div className="treatment-actions">
                  <button 
                    className="action-btn complete"
                    onClick={() => handleUpdateAppointmentStatus(data.currentTreatment.id, 'COMPLETED')}
                  >
                    ✅ Hoàn thành
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        <div className="dashboard-section todays-schedule">
          <h2>📅 Lịch hôm nay ({data.todayAppointments.length})</h2>
          <div className="section-content">
            {data.todayAppointments.length === 0 ? (
              <p>Không có lịch hẹn nào hôm nay</p>
            ) : (
              <div className="schedule-list">
                {data.todayAppointments.map(appointment => {
                  const statusStyle = getStatusStyle(appointment.status);
                  return (
                    <div key={appointment.id} className="schedule-item">
                      <div className="schedule-time">{appointment.formattedTime}</div>
                      <div className="schedule-info">
                        <div className="customer-name">{appointment.customerName}</div>
                        <div className="service-name">{appointment.serviceName}</div>
                        <div className="appointment-notes">{appointment.customerNotes}</div>
                      </div>
                      <div className="schedule-status">
                        <span 
                          className="status-badge"
                          style={{
                            background: statusStyle.background,
                            color: statusStyle.color
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      <div className="schedule-actions">
                        {appointment.status === 'CONFIRMED' && (
                          <button 
                            className="action-btn start"
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'IN_PROGRESS')}
                          >
                            ▶️ Bắt đầu
                          </button>
                        )}
                        {appointment.status === 'CHECKED_IN' && (
                          <button 
                            className="action-btn start"
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'IN_PROGRESS')}
                          >
                            ▶️ Bắt đầu điều trị
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Next Appointment */}
        <div className="dashboard-section next-appointment">
          <h2>⏭️ Lịch hẹn tiếp theo</h2>
          <div className="section-content">
            {nextAppointment ? (
              <div className="next-appointment-card">
                <div className="appointment-details">
                  <div className="customer-name">{nextAppointment.customerName}</div>
                  <div className="service-name">{nextAppointment.serviceName}</div>
                  <div className="appointment-time">
                    🕐 {nextAppointment.formattedTime}
                  </div>
                  <div className="appointment-duration">
                    ⏱️ {nextAppointment.formattedDuration || '60 phút'}
                  </div>
                </div>
                <div className="preparation-notes">
                  <strong>Ghi chú chuẩn bị:</strong>
                  <p>{nextAppointment.customerNotes || 'Không có ghi chú đặc biệt'}</p>
                </div>
              </div>
            ) : (
              <p>Không có lịch hẹn tiếp theo hôm nay</p>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="dashboard-section performance">
          <h2>🏆 Hiệu suất của tôi</h2>
          <div className="section-content">
            <div className="performance-stats">
              <div className="perf-item">
                <span className="label">Hoàn thành hôm nay:</span>
                <span className="value">
                  {data.todayAppointments.filter(apt => apt.status === 'COMPLETED').length}/{data.todayAppointments.length}
                </span>
              </div>
              <div className="perf-item">
                <span className="label">Tổng lịch hẹn:</span>
                <span className="value">{data.myAppointments.length}</span>
              </div>
              <div className="perf-item">
                <span className="label">Tỷ lệ hoàn thành:</span>
                <span className="value">
                  {data.myAppointments.length > 0 
                    ? Math.round((data.myAppointments.filter(apt => apt.status === 'COMPLETED').length / data.myAppointments.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="perf-item">
                <span className="label">Đánh giá trung bình:</span>
                <span className="value">⭐ 4.8/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="dashboard-section quick-tools">
          <h2>🛠️ Công cụ nhanh</h2>
          <div className="section-content">
            <div className="tool-buttons">
              <button 
                className="tool-btn photo"
                onClick={() => window.location.href = '/technician/photos'}
              >
                📷 Tải ảnh lên
              </button>
              <button 
                className="tool-btn notes"
                onClick={() => window.location.href = '/technician/treatments'}
              >
                📝 Ghi chú điều trị
              </button>
              <button 
                className="tool-btn appointments"
                onClick={() => window.location.href = '/technician/appointments'}
              >
                📅 Xem tất cả lịch hẹn
              </button>
              <button 
                className="tool-btn customers"
                onClick={() => window.location.href = '/technician/customers'}
              >
                👤 Xem khách hàng
              </button>
            </div>
          </div>
        </div>

        {/* Recent Work */}
        <div className="dashboard-section recent-work">
          <h2>📋 Công việc gần đây</h2>
          <div className="section-content">
            {data.myAppointments.length === 0 ? (
              <p>Chưa có lịch hẹn nào</p>
            ) : (
              <div className="work-list">
                {data.myAppointments.slice(0, 5).map(appointment => {
                  const statusStyle = getStatusStyle(appointment.status);
                  return (
                    <div key={appointment.id} className="work-item">
                      <div className="work-date">
                        {formatDateTimeVN(appointment.appointmentDate)}
                      </div>
                      <div className="work-info">
                        <div className="customer-name">{appointment.customerName}</div>
                        <div className="service-name">{appointment.serviceName}</div>
                      </div>
                      <div className="work-status">
                        <span 
                          className="status-badge"
                          style={{
                            background: statusStyle.background,
                            color: statusStyle.color
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

export default TechnicianDashboard;
