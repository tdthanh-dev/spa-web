import React, { useState, useEffect } from 'react';
import { spaCustomersAPI, appointmentsAPI, invoicesAPI, servicesAPI } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { formatCurrencyVN } from '@/utils/formatters';
import './Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState({
    overview: {},
    appointments: [],
    revenue: [],
    customers: [],
    services: [],
    loading: true
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setReportData(prev => ({ ...prev, loading: true }));

      // Load all report data in parallel
      const [customersRes, appointmentsRes, invoicesRes, servicesRes] = await Promise.all([
        spaCustomersAPI.getAll(0, 1000),
        appointmentsAPI.getAll(0, 1000),
        invoicesAPI.getAll(0, 1000),
        servicesAPI.getAll(0, 1000)
      ]);

      const customers = customersRes.data?.content || [];
      const appointments = appointmentsRes.data?.content || [];
      const invoices = invoicesRes.data?.content || [];
      const services = servicesRes.data?.content || [];

      // Filter data by date range
      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.createdAt);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return aptDate >= start && aptDate <= end;
      });

      const filteredInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return invDate >= start && invDate <= end;
      });

      // Calculate overview metrics
      const overview = {
        totalCustomers: customers.length,
        totalAppointments: filteredAppointments.length,
        totalRevenue: filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        completedAppointments: filteredAppointments.filter(apt => apt.status === 'COMPLETED').length,
        newCustomers: customers.filter(cust => {
          const custDate = new Date(cust.createdAt);
          const start = new Date(dateRange.startDate);
          const end = new Date(dateRange.endDate);
          return custDate >= start && custDate <= end;
        }).length
      };

      // Calculate revenue by service
      const revenueByService = {};
      filteredInvoices.forEach(invoice => {
        const serviceName = invoice.serviceName || 'Unknown Service';
        revenueByService[serviceName] = (revenueByService[serviceName] || 0) + (invoice.totalAmount || 0);
      });

      const revenue = Object.entries(revenueByService)
        .map(([service, amount]) => ({ service, amount }))
        .sort((a, b) => b.amount - a.amount);

      // Calculate appointments by technician
      const appointmentsByTechnician = {};
      filteredAppointments.forEach(apt => {
        const technicianName = apt.technicianName || 'Unknown';
        appointmentsByTechnician[technicianName] = (appointmentsByTechnician[technicianName] || 0) + 1;
      });

      setReportData({
        overview,
        appointments: filteredAppointments,
        revenue,
        customers: customers.slice(0, 50), // Recent customers
        services,
        appointmentsByTechnician: Object.entries(appointmentsByTechnician)
          .map(([technician, count]) => ({ technician, count }))
          .sort((a, b) => b.count - a.count),
        loading: false
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      setReportData(prev => ({ ...prev, loading: false }));
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderOverviewTab = () => (
    <div className="report-overview">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{reportData.overview.totalCustomers}</div>
          <div className="metric-label">Tổng khách hàng</div>
          <div className="metric-change">+{reportData.overview.newCustomers} mới</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{reportData.overview.totalAppointments}</div>
          <div className="metric-label">Tổng lịch hẹn</div>
          <div className="metric-change">
            {reportData.overview.completedAppointments} hoàn thành
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{formatCurrencyVN(reportData.overview.totalRevenue)}</div>
          <div className="metric-label">Tổng doanh thu</div>
          <div className="metric-change">
            {Math.round((reportData.overview.completedAppointments / reportData.overview.totalAppointments) * 100) || 0}% hoàn thành
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {reportData.overview.totalAppointments > 0
              ? Math.round((reportData.overview.completedAppointments / reportData.overview.totalAppointments) * 100)
              : 0}%
          </div>
          <div className="metric-label">Tỷ lệ hoàn thành</div>
          <div className="metric-change">lịch hẹn</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Doanh thu theo dịch vụ</h3>
          <div className="revenue-chart">
            {reportData.revenue.slice(0, 5).map((item, index) => (
              <div key={item.service} className="chart-bar">
                <div className="bar-label">{item.service}</div>
                <div
                  className="bar-fill"
                  style={{
                    width: `${(item.amount / Math.max(...reportData.revenue.map(r => r.amount))) * 100}%`,
                    backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                  }}
                ></div>
                <div className="bar-value">{formatCurrencyVN(item.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>Lịch hẹn theo kỹ thuật viên</h3>
          <div className="technician-chart">
            {reportData.appointmentsByTechnician?.slice(0, 5).map((item, index) => (
              <div key={item.technician} className="chart-item">
                <div className="technician-name">{item.technician}</div>
                <div className="appointment-count">{item.count} lịch</div>
                <div
                  className="progress-bar"
                  style={{
                    width: `${(item.count / Math.max(...reportData.appointmentsByTechnician.map(t => t.count))) * 100}%`,
                    backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointmentsTab = () => (
    <div className="appointments-report">
      <div className="report-header">
        <h3>Báo cáo lịch hẹn</h3>
        <button
          className="export-btn"
          onClick={() => exportToCSV(reportData.appointments, 'appointments-report.csv')}
        >
          📊 Xuất CSV
        </button>
      </div>

      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Kỹ thuật viên</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {reportData.appointments.map(appointment => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{appointment.customerName}</td>
                <td>{appointment.serviceName}</td>
                <td>{appointment.technicianName || 'N/A'}</td>
                <td>{formatDateTimeVN(appointment.startAt)}</td>
                <td>
                  <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRevenueTab = () => (
    <div className="revenue-report">
      <div className="report-header">
        <h3>Báo cáo doanh thu</h3>
        <button
          className="export-btn"
          onClick={() => exportToCSV(reportData.revenue, 'revenue-report.csv')}
        >
          📊 Xuất CSV
        </button>
      </div>

      <div className="revenue-table">
        <table>
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Doanh thu</th>
              <th>Tỷ lệ (%)</th>
            </tr>
          </thead>
          <tbody>
            {reportData.revenue.map((item, index) => {
              const totalRevenue = reportData.revenue.reduce((sum, r) => sum + r.amount, 0);
              const percentage = totalRevenue > 0 ? ((item.amount / totalRevenue) * 100).toFixed(1) : 0;

              return (
                <tr key={item.service}>
                  <td>{item.service}</td>
                  <td>{formatCurrencyVN(item.amount)}</td>
                  <td>{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomersTab = () => (
    <div className="customers-report">
      <div className="report-header">
        <h3>Danh sách khách hàng</h3>
        <button
          className="export-btn"
          onClick={() => exportToCSV(reportData.customers, 'customers-report.csv')}
        >
          📊 Xuất CSV
        </button>
      </div>

      <div className="customers-grid">
        {reportData.customers.map(customer => (
          <div key={customer.id} className="customer-card">
            <div className="customer-name">{customer.fullName}</div>
            <div className="customer-contact">
              <div>{customer.phone}</div>
              <div>{customer.email}</div>
            </div>
            <div className="customer-stats">
              <div>Hạng: {customer.tier?.name || 'N/A'}</div>
              <div>Điểm: {customer.totalPoints || 0}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (reportData.loading) {
    return (
      <div className="reports">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>📊 Báo cáo & Phân tích</h1>
        <p>Phân tích dữ liệu và hiệu suất kinh doanh</p>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <div className="filter-group">
          <label>Từ ngày:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div className="filter-group">
          <label>Đến ngày:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        <button className="filter-btn" onClick={loadReportData}>
          🔄 Cập nhật
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Tổng quan
        </button>
        <button
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Lịch hẹn
        </button>
        <button
          className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          💰 Doanh thu
        </button>
        <button
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          👥 Khách hàng
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'appointments' && renderAppointmentsTab()}
        {activeTab === 'revenue' && renderRevenueTab()}
        {activeTab === 'customers' && renderCustomersTab()}
      </div>
    </div>
  );
};

export default Reports;
