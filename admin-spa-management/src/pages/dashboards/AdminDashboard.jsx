// filepath: admin-spa-management/src/pages/dashboards/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { spaCustomersAPI, servicesAPI, appointmentsAPI } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import './AdminDashboard.css';

/**
 * Admin Dashboard - Overview for system administrators
 * Shows high-level analytics, system health, and management shortcuts
 */
const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalServices: 0,
    todayAppointments: 0,
    activeServices: 0,
    loading: true
  });

  const [recentData, setRecentData] = useState({
    recentCustomers: [],
    popularServices: [],
    todayAppointments: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic statistics
      const [customersRes, servicesRes, appointmentsRes] = await Promise.all([
        spaCustomersAPI.getAll(0, 1), // Just to get total count
        servicesAPI.getAll(0, 1), // Just to get total count
        appointmentsAPI.getTodayAppointments()
      ]);

      const customersData = customersRes.data?.success ? customersRes.data.data : { totalElements: 0 };
      const servicesData = servicesRes.data?.success ? servicesRes.data.data : { totalElements: 0 };
      const appointmentsData = appointmentsRes.data?.success ? appointmentsRes.data.data : [];

      setStats({
        totalCustomers: customersData.totalElements || 0,
        totalServices: servicesData.totalElements || 0,
        todayAppointments: appointmentsData.length || 0,
        activeServices: servicesData.totalElements || 0,
        loading: false
      });

      // Fetch recent data
      const recentCustomersRes = await spaCustomersAPI.getAll(0, 5);
      const activeServicesRes = await servicesAPI.getActive();

      setRecentData({
        recentCustomers: recentCustomersRes.data?.success ? recentCustomersRes.data.data.content || [] : [],
        popularServices: activeServicesRes.data?.success ? (activeServicesRes.data.data || []).slice(0, 5) : [],
        todayAppointments: appointmentsData.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>👑 Admin Dashboard</h1>
        <p>Tổng quan hệ thống và quản lý toàn diện</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-number">{stats.totalCustomers}</div>
          <div className="metric-label">Tổng khách hàng</div>
          <div className="metric-icon">👥</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">{stats.totalServices}</div>
          <div className="metric-label">Tổng dịch vụ</div>
          <div className="metric-icon">💼</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">{stats.todayAppointments}</div>
          <div className="metric-label">Lịch hẹn hôm nay</div>
          <div className="metric-icon">📅</div>
        </div>
        <div className="metric-card">
          <div className="metric-number">{stats.activeServices}</div>
          <div className="metric-label">Dịch vụ hoạt động</div>
          <div className="metric-icon">✅</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Customers */}
        <div className="dashboard-section recent-customers">
          <h2>👥 Khách hàng mới nhất</h2>
          <div className="section-content">
            {recentData.recentCustomers.length === 0 ? (
              <p>Chưa có khách hàng nào</p>
            ) : (
              <div className="customers-list">
                {recentData.recentCustomers.map(customer => (
                  <div key={customer.id} className="customer-item">
                    <div className="customer-info">
                      <div className="customer-name">{customer.fullName}</div>
                      <div className="customer-phone">{customer.phone}</div>
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

        {/* Popular Services */}
        <div className="dashboard-section popular-services">
          <h2>💼 Dịch vụ phổ biến</h2>
          <div className="section-content">
            {recentData.popularServices.length === 0 ? (
              <p>Chưa có dịch vụ nào</p>
            ) : (
              <div className="services-list">
                {recentData.popularServices.map(service => (
                  <div key={service.id} className="service-item">
                    <div className="service-info">
                      <div className="service-name">{service.serviceName}</div>
                      <div className="service-category">{service.categoryDisplayName}</div>
                    </div>
                    <div className="service-price">
                      {service.formattedPrice}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="dashboard-section todays-appointments">
          <h2>📅 Lịch hẹn hôm nay</h2>
          <div className="section-content">
            {recentData.todayAppointments.length === 0 ? (
              <p>Không có lịch hẹn nào hôm nay</p>
            ) : (
              <div className="appointments-list">
                {recentData.todayAppointments.map(appointment => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-info">
                      <div className="appointment-customer">{appointment.customerName}</div>
                      <div className="appointment-service">{appointment.serviceName}</div>
                    </div>
                    <div className="appointment-time">
                      {appointment.formattedTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="dashboard-section quick-actions">
          <h2>⚡ Quick Actions</h2>
          <div className="section-content">
            <div className="action-buttons">
              <button className="action-btn" onClick={() => window.location.href = '/admin/users'}>
                ➕ Quản lý nhân viên
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/services'}>
                💼 Quản lý dịch vụ  
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/customers'}>
                👥 Quản lý khách hàng
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/appointments'}>
                📅 Quản lý lịch hẹn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
