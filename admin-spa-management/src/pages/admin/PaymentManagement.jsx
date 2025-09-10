import React, { useState, useEffect } from 'react';
import { paymentsAPI, invoicesAPI } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { formatCurrencyVN } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import './PaymentManagement.css';

const PaymentManagement = () => {
  const { userRole } = useAuth();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showCreatePayment, setShowCreatePayment] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'payments') {
        const paymentsResponse = await paymentsAPI.getAll(0, 50);
        setPayments(paymentsResponse.data?.content || []);
      } else {
        const invoicesResponse = await invoicesAPI.getAll(0, 50);
        setInvoices(invoicesResponse.data?.content || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const statusData = {
        status: newStatus,
        reason: `Updated by ${userRole} at ${new Date().toISOString()}`
      };

      if (activeTab === 'payments') {
        await paymentsAPI.updateStatus(id, statusData);
        setPayments(prev =>
          prev.map(payment =>
            payment.id === id ? { ...payment, status: newStatus } : payment
          )
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi khi cập nhật trạng thái');
    }
  };

  const handleCreatePayment = async (paymentData) => {
    try {
      await paymentsAPI.create(paymentData);
      setShowCreatePayment(false);
      loadData();
      alert('Tạo thanh toán thành công!');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Có lỗi khi tạo thanh toán');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'pending', label: 'Chờ xử lý', color: '#fbbf24' },
      'COMPLETED': { class: 'completed', label: 'Hoàn thành', color: '#10b981' },
      'FAILED': { class: 'failed', label: 'Thất bại', color: '#ef4444' },
      'REFUNDED': { class: 'refunded', label: 'Hoàn tiền', color: '#8b5cf6' },
      'CANCELLED': { class: 'cancelled', label: 'Đã hủy', color: '#6b7280' }
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm ||
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm ||
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderPaymentsTab = () => (
    <div className="payments-section">
      <div className="section-header">
        <h3>💳 Quản lý thanh toán</h3>
        {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
          <button
            className="create-btn"
            onClick={() => setShowCreatePayment(true)}
          >
            ➕ Tạo thanh toán
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng hoặc ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="FAILED">Thất bại</option>
            <option value="REFUNDED">Hoàn tiền</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => {
              const statusInfo = getStatusBadge(payment.status);
              return (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.customerName}</td>
                  <td>{formatCurrencyVN(payment.amount)}</td>
                  <td>{payment.paymentMethod || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td>{formatDateTimeVN(payment.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        👁️
                      </button>
                      {payment.status === 'PENDING' && (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() => handleStatusUpdate(payment.id, 'COMPLETED')}
                          >
                            ✓
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleStatusUpdate(payment.id, 'FAILED')}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">💳</div>
          <p>Không tìm thấy thanh toán nào</p>
        </div>
      )}
    </div>
  );

  const renderInvoicesTab = () => (
    <div className="invoices-section">
      <div className="section-header">
        <h3>📄 Quản lý hóa đơn</h3>
        {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
          <button className="create-btn">
            ➕ Tạo hóa đơn
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng hoặc ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="OVERDUE">Quá hạn</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="invoices-grid">
        {filteredInvoices.map(invoice => {
          const statusInfo = getStatusBadge(invoice.status);
          return (
            <div key={invoice.id} className="invoice-card">
              <div className="invoice-header">
                <div className="invoice-id">#{invoice.id}</div>
                <div className="invoice-date">{formatDateTimeVN(invoice.createdAt)}</div>
              </div>

              <div className="invoice-body">
                <div className="customer-info">
                  <div className="customer-name">{invoice.customerName}</div>
                  <div className="customer-phone">{invoice.customerPhone}</div>
                </div>

                <div className="invoice-details">
                  <div className="service-name">{invoice.serviceName}</div>
                  <div className="invoice-amount">{formatCurrencyVN(invoice.totalAmount)}</div>
                </div>
              </div>

              <div className="invoice-footer">
                <span className={`status-badge ${statusInfo.class}`}>
                  {statusInfo.label}
                </span>

                <div className="invoice-actions">
                  <button className="view-btn">👁️ Chi tiết</button>
                  {invoice.status === 'PENDING' && (
                    <button className="pay-btn">💳 Thanh toán</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">📄</div>
          <p>Không tìm thấy hóa đơn nào</p>
        </div>
      )}
    </div>
  );

  // Payment Details Modal
  const renderPaymentDetailsModal = () => {
    if (!selectedPayment) return null;

    return (
      <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Chi tiết thanh toán #{selectedPayment.id}</h2>
            <button
              className="modal-close"
              onClick={() => setSelectedPayment(null)}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="payment-details">
              <div className="detail-row">
                <label>Khách hàng:</label>
                <span>{selectedPayment.customerName}</span>
              </div>

              <div className="detail-row">
                <label>Số tiền:</label>
                <span>{formatCurrencyVN(selectedPayment.amount)}</span>
              </div>

              <div className="detail-row">
                <label>Phương thức:</label>
                <span>{selectedPayment.paymentMethod || 'N/A'}</span>
              </div>

              <div className="detail-row">
                <label>Trạng thái:</label>
                <span className={`status-badge ${getStatusBadge(selectedPayment.status).class}`}>
                  {getStatusBadge(selectedPayment.status).label}
                </span>
              </div>

              <div className="detail-row">
                <label>Thời gian:</label>
                <span>{formatDateTimeVN(selectedPayment.createdAt)}</span>
              </div>

              {selectedPayment.notes && (
                <div className="detail-row">
                  <label>Ghi chú:</label>
                  <span>{selectedPayment.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn-secondary"
              onClick={() => setSelectedPayment(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="payment-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="header">
        <h1>💰 Quản lý thanh toán</h1>
        <p>Quản lý thanh toán và hóa đơn của spa</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          💳 Thanh toán
        </button>
        <button
          className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          📄 Hóa đơn
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'payments' && renderPaymentsTab()}
        {activeTab === 'invoices' && renderInvoicesTab()}
      </div>

      {/* Modals */}
      {renderPaymentDetailsModal()}
    </div>
  );
};

export default PaymentManagement;
