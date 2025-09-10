// filepath: admin-spa-management/src/pages/appointments/AppointmentCalendar.jsx

import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import './AppointmentCalendar.css';

/**
 * Appointment Calendar Component
 * Calendar view for managing appointments with basic functionality
 */
const AppointmentCalendar = ({ userRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, viewMode]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on view mode
      const { startDate, endDate } = getDateRange(currentDate, viewMode);
      
      const response = await appointmentsAPI.getCalendar(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (response.data && response.data.success) {
        setAppointments(response.data.data || []);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Không thể tải lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (date, mode) => {
    const startDate = new Date(date);
    const endDate = new Date(date);

    switch (mode) {
      case 'day':
        endDate.setDate(startDate.getDate() + 1);
        break;
      case 'week':
        startDate.setDate(date.getDate() - date.getDay()); // Start of week
        endDate.setDate(startDate.getDate() + 6); // End of week
        break;
      case 'month':
        startDate.setDate(1); // Start of month
        endDate.setMonth(startDate.getMonth() + 1, 0); // End of month
        break;
    }

    return { startDate, endDate };
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
    }
    setCurrentDate(newDate);
  };

  const getStatusStyle = (status) => {
    const styles = {
      SCHEDULED: { background: '#dbeafe', color: '#1e40af' },
      CONFIRMED: { background: '#dcfce7', color: '#166534' },
      CHECKED_IN: { background: '#fef3c7', color: '#92400e' },
      IN_PROGRESS: { background: '#e0e7ff', color: '#5b21b6' },
      COMPLETED: { background: '#dcfce7', color: '#166534' },
      CANCELLED: { background: '#fee2e2', color: '#dc2626' },
      NO_SHOW: { background: '#f3f4f6', color: '#6b7280' }
    };
    return styles[status] || styles.SCHEDULED;
  };

  const formatTimeRange = (start, end) => {
    const startTime = new Date(start).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = end ? new Date(end).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : '?';
    return `${startTime} - ${endTime}`;
  };

  if (loading) {
    return (
      <div className="appointment-calendar">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải lịch hẹn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-calendar">
      {/* Header */}
      <div className="calendar-header">
        <h1>📅 Lịch hẹn</h1>
        <div className="header-actions">
          {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
            <button className="btn btn-primary">➕ Đặt lịch mới</button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="calendar-navigation">
        <div className="nav-controls">
          <button onClick={() => navigateDate(-1)} className="nav-btn">
            ← {viewMode === 'day' ? 'Hôm qua' : viewMode === 'week' ? 'Tuần trước' : 'Tháng trước'}
          </button>
          
          <h2 className="current-period">
            {viewMode === 'month' 
              ? currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
              : currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
            }
          </h2>
          
          <button onClick={() => navigateDate(1)} className="nav-btn">
            {viewMode === 'day' ? 'Ngày mai' : viewMode === 'week' ? 'Tuần sau' : 'Tháng sau'} →
          </button>
        </div>

        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Ngày
          </button>
          <button 
            className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Tuần
          </button>
          <button 
            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={fetchAppointments} className="retry-btn">Thử lại</button>
        </div>
      )}

      {/* Appointments List */}
      <div className="appointments-container">
        <div className="appointments-header">
          <h3>Lịch hẹn ({appointments.length})</h3>
          <div className="legend">
            <span className="legend-item scheduled">📅 Đã đặt</span>
            <span className="legend-item confirmed">✅ Xác nhận</span>
            <span className="legend-item in-progress">🔄 Đang thực hiện</span>
            <span className="legend-item completed">✅ Hoàn thành</span>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="no-appointments">
            <div className="no-data-icon">📅</div>
            <p>Không có lịch hẹn nào trong khoảng thời gian này</p>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment) => {
              const statusStyle = getStatusStyle(appointment.status);
              
              return (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-time">
                    <div className="time-range">
                      {formatTimeRange(appointment.start, appointment.end)}
                    </div>
                    <div className="date">
                      {new Date(appointment.start).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className="appointment-content">
                    <div className="appointment-title">{appointment.title}</div>
                    <div className="appointment-details">
                      <span>👤 {appointment.customerName}</span>
                      <span>💼 {appointment.serviceName}</span>
                      <span>🎨 {appointment.technicianName || 'Chưa phân công'}</span>
                    </div>
                    <div className="appointment-description">
                      {appointment.description}
                    </div>
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

                  <div className="appointment-actions">
                    <button className="action-btn view">👁️</button>
                    {appointment.editable && (
                      <button className="action-btn edit">✏️</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Hôm nay:</span>
          <span className="stat-value">
            {appointments.filter(a => {
              const today = new Date().toDateString();
              return new Date(a.start).toDateString() === today;
            }).length} lịch hẹn
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Hoàn thành:</span>
          <span className="stat-value">
            {appointments.filter(a => a.status === 'COMPLETED').length} lịch hẹn
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Đang chờ:</span>
          <span className="stat-value">
            {appointments.filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status)).length} lịch hẹn
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
