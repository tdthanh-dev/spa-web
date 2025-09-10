import React, { useState, useEffect } from 'react';
import { spaCustomersAPI, servicesAPI, appointmentsAPI, invoicesAPI, leadsAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import './AdminDashboard.css';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalServices: 0,
    todayAppointments: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    loading: true
  });

  const [recentData, setRecentData] = useState({
    recentCustomers: [],
    recentAppointments: [],
    pendingInvoices: []
  });

  const { userRole } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Load basic statistics
      const [
        customersRes,
        servicesRes,
        appointmentsRes,
        invoicesRes,
        leadsRes
      ] = await Promise.allSettled([
        spaCustomersAPI.getAll(0, 1),
        servicesAPI.getAll(0, 1),
        appointmentsAPI.getTodayAppointments(),
        invoicesAPI.getAll(0, 1),
        leadsAPI.getStats()
      ]);

      // Process results
      const customerStats = customersRes.status === 'fulfilled' && customersRes.value.data?.success
        ? customersRes.value.data.data : { totalElements: 0 };

      const serviceStats = servicesRes.status === 'fulfilled' && servicesRes.value.data?.success
        ? servicesRes.value.data.data : { totalElements: 0 };

      const appointmentData = appointmentsRes.status === 'fulfilled' && appointmentsRes.value.data?.success
        ? appointmentsRes.value.data.data : [];

      const invoiceStats = invoicesRes.status === 'fulfilled' && invoicesRes.value.data?.success
        ? invoicesRes.value.data.data : { totalElements: 0 };

      const leadStats = leadsRes.status === 'fulfilled'
        ? leadsRes.value.data : { todayCount: 0, totalCount: 0 };

      setStats({
        totalCustomers: customerStats.totalElements || 0,
        totalServices: serviceStats.totalElements || 0,
        todayAppointments: appointmentData.length || 0,
        totalInvoices: invoiceStats.totalElements || 0,
        totalRevenue: calculateTotalRevenue(invoiceStats.content || []),
        todayLeads: leadStats.todayCount || 0,
        totalLeads: leadStats.totalCount || 0,
        loading: false
      });

      // Load recent data
      await loadRecentData();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const loadRecentData = async () => {
    try {
      const [
        recentCustomersRes,
        recentAppointmentsRes,
        pendingInvoicesRes
      ] = await Promise.allSettled([
        spaCustomersAPI.getAll(0, 5),
        appointmentsAPI.getAll(0, 5),
        invoicesAPI.getAll(0, 5)
      ]);

      const recentCustomers = recentCustomersRes.status === 'fulfilled' && recentCustomersRes.value.data?.success
        ? recentCustomersRes.value.data.data.content || [] : [];

      const recentAppointments = recentAppointmentsRes.status === 'fulfilled' && recentAppointmentsRes.value.data?.success
        ? recentAppointmentsRes.value.data.content || [] : [];

      const pendingInvoices = pendingInvoicesRes.status === 'fulfilled' && pendingInvoicesRes.value.data?.success
        ? (pendingInvoicesRes.value.data.data.content || []).filter(inv => inv.status === 'UNPAID') : [];

      setRecentData({
        recentCustomers,
        recentAppointments,
        pendingInvoices: pendingInvoices.slice(0, 5)
      });

    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  };

  const calculateTotalRevenue = (invoices) => {
    return invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((total, inv) => total + (inv.grandTotal || 0), 0);
  };

  if (stats.loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Welcome back, {user?.fullName}! Here's your business overview.</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalCustomers}</div>
            <div className="metric-label">Total Customers</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💼</div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalServices}</div>
            <div className="metric-label">Active Services</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <div className="metric-value">{stats.todayAppointments}</div>
            <div className="metric-label">Today's Appointments</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">${stats.totalRevenue.toFixed(2)}</div>
            <div className="metric-label">Total Revenue</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📄</div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalInvoices}</div>
            <div className="metric-label">Total Invoices</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{stats.todayLeads}</div>
            <div className="metric-label">Today's Leads</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Customers */}
        <div className="dashboard-section">
          <h2>👥 Recent Customers</h2>
          <div className="section-content">
            {recentData.recentCustomers.length === 0 ? (
              <p>No recent customers</p>
            ) : (
              <div className="recent-list">
                {recentData.recentCustomers.map(customer => (
                  <div key={customer.customerId} className="recent-item">
                    <div className="item-info">
                      <div className="item-title">{customer.fullName}</div>
                      <div className="item-subtitle">{customer.phone}</div>
                    </div>
                    <div className="item-date">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="dashboard-section">
          <h2>📅 Today's Appointments</h2>
          <div className="section-content">
            {recentData.recentAppointments.length === 0 ? (
              <p>No appointments today</p>
            ) : (
              <div className="recent-list">
                {recentData.recentAppointments.map(appointment => (
                  <div key={appointment.apptId} className="recent-item">
                    <div className="item-info">
                      <div className="item-title">{appointment.customerName}</div>
                      <div className="item-subtitle">{appointment.serviceName}</div>
                    </div>
                    <div className="item-time">
                      {appointment.startAt ? new Date(appointment.startAt).toLocaleTimeString() : 'TBD'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="dashboard-section">
          <h2>💰 Pending Invoices</h2>
          <div className="section-content">
            {recentData.pendingInvoices.length === 0 ? (
              <p>No pending invoices</p>
            ) : (
              <div className="recent-list">
                {recentData.pendingInvoices.map(invoice => (
                  <div key={invoice.invoiceId} className="recent-item">
                    <div className="item-info">
                      <div className="item-title">{invoice.invoiceNumber}</div>
                      <div className="item-subtitle">{invoice.customerName}</div>
                    </div>
                    <div className="item-amount">
                      ${invoice.grandTotal?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.location.href = '/admin/customers'}>
            👥 Manage Customers
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/services'}>
            💼 Manage Services
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/appointments'}>
            📅 Manage Appointments
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/invoices'}>
            💰 Manage Invoices
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/leads'}>
            🎯 View Leads
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin/audit'}>
            📊 Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
