import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersService, customerCaseService, invoiceService, paymentService } from '@/services';
import { formatDateTimeVN } from '@/utils/dateUtils';
import CustomerCaseCreationModal from './CustomerCaseCreationModal';
import InvoiceCreationModal from '../Billing/InvoiceCreationModal';


const CustomerDetailModal = ({
  isOpen,
  onClose,
  customerId,
  onEdit = null,
  userRole
}) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, treatments, appointments, financial, photos

  // Modal states
  const [showCaseCreationModal, setShowCaseCreationModal] = useState(false);
  const [showInvoiceCreationModal, setShowInvoiceCreationModal] = useState(false);

  // Tab-specific data
  const [tabData, setTabData] = useState({
    treatments: [],
    appointments: [],
    financial: [],
    photos: []
  });

  const [tabLoading, setTabLoading] = useState({
    treatments: false,
    appointments: false,
    financial: false,
    photos: false
  });

  const fetchCustomerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== FETCHING CUSTOMER DATA ===');
      console.log('Customer ID:', customerId);
      console.log('API Endpoint:', `${customersService.endpoint}/${customerId}`);

      const response = await customersService.getById(customerId);
      
      console.log('=== CUSTOMER API RESPONSE ===');
      console.log('Full Response:', response);
      console.log('Customer Data:', {
        customerId: response?.customerId,
        fullName: response?.fullName,
        totalSpent: response?.totalSpent,
        totalPoints: response?.totalPoints,
        tierCode: response?.tierCode,
        tierName: response?.tierName,
        isVip: response?.isVip
      });

      setCustomer(response);

    } catch (err) {
      console.error('=== ERROR FETCHING CUSTOMER ===');
      console.error('Error details:', err);
      console.error('Response data:', err.response?.data);
      setError('Không thể tải thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerData();
    }
  }, [isOpen, customerId, fetchCustomerData]);

  const loadTabData = useCallback(async (tab) => {
    if (tabData[tab]?.length > 0) return; // Already loaded

    try {
      setTabLoading(prev => ({ ...prev, [tab]: true }));

      let data = [];

      switch (tab) {
        case 'treatments':
          try {
            const response = await customerCaseService.getByCustomerId(customerId);
            data = response?.content || [];
          } catch (err) {
            console.error('Error loading treatment data:', err);
            data = [];
          }
          break;

        case 'appointments':
          // TODO: Implement appointment history API call
          // data = await appointmentService.getByCustomerId(customerId);
          data = [
            {
              id: 1,
              serviceName: 'Phun môi - Tư vấn',
              date: '2024-01-14',
              status: 'COMPLETED',
              technician: 'Nguyễn Thị Lan'
            },
            {
              id: 2,
              serviceName: 'Phun mày - Tư vấn',
              date: '2024-02-18',
              status: 'COMPLETED',
              technician: 'Trần Văn Nam'
            }
          ];
          break;

        case 'financial':
          try {
            // Load both invoices and payments for customer
            const [invoicesResponse, paymentsResponse] = await Promise.all([
              invoiceService.getByCustomerId(customerId),
              paymentService.getByCustomerId(customerId)
            ]);

            const invoices = (invoicesResponse?.content || []).map(invoice => ({
              id: `inv_${invoice.invoiceId}`,
              type: 'INVOICE',
              amount: invoice.finalAmount || invoice.totalAmount,
              description: `Hóa đơn #${invoice.invoiceNumber}`,
              date: invoice.createdAt,
              status: invoice.status,
              invoiceId: invoice.invoiceId
            }));

            const payments = (paymentsResponse?.content || []).map(payment => ({
              id: `pay_${payment.paymentId}`,
              type: 'PAYMENT',
              amount: payment.amount,
              description: `Thanh toán - ${payment.method}`,
              date: payment.paidAt || payment.createdAt,
              status: payment.status,
              paymentId: payment.paymentId,
              pointsEarned: Math.floor(payment.amount / 100000) // 1 point per 100k VND
            }));

            // Combine and sort by date
            data = [...invoices, ...payments].sort((a, b) =>
              new Date(b.date) - new Date(a.date)
            );
          } catch (err) {
            console.error('Error loading financial data:', err);
            data = [];
          }
          break;

        case 'photos':
          // TODO: Implement photo gallery API call
          // data = await photoService.getByCustomerId(customerId);
          data = [
            {
              id: 1,
              serviceName: 'Phun môi',
              beforePhoto: '/images/before1.jpg',
              afterPhoto: '/images/after1.jpg',
              date: '2024-01-15'
            }
          ];
          break;
      }

      setTabData(prev => ({ ...prev, [tab]: data }));

    } catch (err) {
      console.error(`Error loading ${tab} data:`, err);
    } finally {
      setTabLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, [customerId, tabData]);

  useEffect(() => {
    if (isOpen && customer) {
      // Load tab data when tab changes
      loadTabData(activeTab);
    }
  }, [isOpen, activeTab, customer, loadTabData]);

  const getTierInfo = (tierCode) => {
    const tiers = {
      'BRONZE': { label: 'Bronze', class: 'bronze', icon: '🥉' },
      'SILVER': { label: 'Silver', class: 'silver', icon: '🥈' },
      'GOLD': { label: 'Gold', class: 'gold', icon: '🥇' },
      'PLATINUM': { label: 'Platinum', class: 'platinum', icon: '💎' },
      'VIP': { label: 'VIP', class: 'vip', icon: '👑' }
    };
    return tiers[tierCode] || tiers['BRONZE'];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleClose = () => {
    setCustomer(null);
    setTabData({
      treatments: [],
      appointments: [],
      financial: [],
      photos: []
    });
    setActiveTab('overview');
    setShowCaseCreationModal(false);
    setShowInvoiceCreationModal(false);
    onClose();
  };

  const handleViewFullProfile = () => {
    if (customerId && userRole) {
      const rolePath = userRole.toLowerCase();
      navigate(`/${rolePath}/customers/${customerId}`);
      onClose(); // Close modal after navigation
    }
  };

  const handleCreateCase = () => {
    setShowCaseCreationModal(true);
  };

  const handleCloseCaseCreationModal = () => {
    setShowCaseCreationModal(false);
  };

  const handleCaseCreated = (newCase) => {
    console.log('New case created:', newCase);
    // Refresh treatments data
    setTabData(prev => ({
      ...prev,
      treatments: []
    }));
    loadTabData('treatments');
    setShowCaseCreationModal(false);
  };

  const handleCreateInvoice = () => {
    setShowInvoiceCreationModal(true);
  };

  const handleCloseInvoiceCreationModal = () => {
    setShowInvoiceCreationModal(false);
  };

  const handleInvoiceCreated = (newInvoice) => {
    console.log('New invoice created:', newInvoice);
    // Refresh customer data to update loyalty program info (points, spending, tier)
    fetchCustomerData();
    // Refresh financial data
    setTabData(prev => ({
      ...prev,
      financial: []
    }));
    loadTabData('financial');
    setShowInvoiceCreationModal(false);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="modal-overlay customer-detail-modal">
        <div className="modal-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin khách hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay customer-detail-modal">
        <div className="modal-content">
          <div className="error-container">
            <h2>⚠️ Có lỗi xảy ra</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchCustomerData}>
              Thử lại
            </button>
            <button className="btn btn-secondary" onClick={handleClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const tierInfo = getTierInfo(customer.tierCode);

  console.log('=== RENDERING CUSTOMER DETAIL ===');
  console.log('Customer object:', customer);
  console.log('Tier info:', tierInfo);
  console.log('Loyalty data:', {
    totalSpent: customer.totalSpent,
    totalPoints: customer.totalPoints,
    tierCode: customer.tierCode,
    isVip: customer.isVip
  });

  return (
    <div className="modal-overlay customer-detail-modal" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="customer-header">
            <div className="customer-basic-info">
              <h2>{customer.fullName}</h2>
              <div className="customer-meta">
                <span className="customer-id">ID: #{customer.customerId}</span>
                <div className={`tier-badge ${tierInfo.class}`}>
                  {tierInfo.icon} {tierInfo.label}
                </div>
                {customer.isVip && <span className="vip-badge">👑 VIP</span>}
              </div>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={fetchCustomerData}
                disabled={loading}
                title="Làm mới thông tin khách hàng"
              >
                {loading ? '⏳' : '🔄'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleViewFullProfile}
                disabled={!userRole}
                title={!userRole ? 'Cần đăng nhập để xem profile đầy đủ' : 'Xem profile đầy đủ'}
              >
                👁️ Xem profile đầy đủ
              </button>
              {onEdit && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => onEdit(customer)}
                >
                  ✏️ Chỉnh sửa
                </button>
              )}
              <button className="close-button" onClick={handleClose}>×</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📋 Tổng quan
            </button>
            <button
              className={`tab-btn ${activeTab === 'treatments' ? 'active' : ''}`}
              onClick={() => setActiveTab('treatments')}
            >
              🩺 Điều trị
            </button>
            <button
              className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              📅 Lịch hẹn
            </button>
            <button
              className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
              onClick={() => setActiveTab('financial')}
            >
              💰 Tài chính
            </button>
            <button
              className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
              onClick={() => setActiveTab('photos')}
            >
              📸 Hình ảnh
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="overview-grid">
                  <div className="info-section">
                    <h3>Thông tin cá nhân</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>📞 Số điện thoại:</label>
                        <span>{customer.phone}</span>
                      </div>
                      <div className="info-item">
                        <label>📧 Email:</label>
                        <span>{customer.email || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="info-item">
                        <label>🎂 Ngày sinh:</label>
                        <span>{customer.dob ? formatDateTimeVN(customer.dob) : 'Chưa cập nhật'}</span>
                      </div>
                      <div className="info-item">
                        <label>⚧ Giới tính:</label>
                        <span>{customer.gender === 'FEMALE' ? 'Nữ' : 'Nam'}</span>
                      </div>
                      <div className="info-item">
                        <label>🏠 Địa chỉ:</label>
                        <span>{customer.address || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="info-item">
                        <label>📝 Ghi chú:</label>
                        <span>{customer.notes || 'Không có'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stats-section">
                    <h3>Thống kê</h3>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                          <div className="stat-label">Tổng chi tiêu</div>
                          <div className="stat-value">
                            {formatCurrency(customer.totalSpent || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-content">
                          <div className="stat-label">Điểm tích lũy</div>
                          <div className="stat-value">{customer.totalPoints || 0}</div>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                          <div className="stat-label">Ngày tham gia</div>
                          <div className="stat-value">
                            {formatDateTimeVN(customer.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'treatments' && (
              <div className="treatments-tab">
                <div className="tab-header">
                  <h3>Lịch sử điều trị</h3>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateCase}
                  >
                    ➕ Tạo hồ sơ điều trị
                  </button>
                </div>
                {tabLoading.treatments ? (
                  <div className="tab-loading">Đang tải...</div>
                ) : (
                  <div className="treatments-list">
                    {tabData.treatments.length === 0 ? (
                      <div className="no-treatments">
                        <div className="no-treatments-icon">🩺</div>
                        <p>Chưa có hồ sơ điều trị nào</p>
                        <button
                          className="btn btn-primary"
                          onClick={handleCreateCase}
                        >
                          Tạo hồ sơ đầu tiên
                        </button>
                      </div>
                    ) : (
                      tabData.treatments.map(treatment => {
                        const getStatusLabel = (status) => {
                          const statusMap = {
                            'INTAKE': 'Tiếp nhận',
                            'IN_PROGRESS': 'Đang điều trị',
                            'COMPLETED': 'Hoàn thành',
                            'ON_HOLD': 'Tạm dừng',
                            'CANCELLED': 'Hủy bỏ'
                          };
                          return statusMap[status] || status;
                        };

                        return (
                          <div key={treatment.caseId} className="treatment-card">
                            <div className="treatment-header">
                              <h4>Hồ sơ #{treatment.caseId}</h4>
                              <span className={`status-badge ${treatment.status?.toLowerCase() || 'intake'}`}>
                                {getStatusLabel(treatment.status)}
                              </span>
                            </div>
                            <div className="treatment-details">
                              <p><strong>Ngày bắt đầu:</strong> {formatDateTimeVN(treatment.startDate)}</p>
                              {treatment.endDate && (
                                <p><strong>Ngày kết thúc:</strong> {formatDateTimeVN(treatment.endDate)}</p>
                              )}
                              <p><strong>Dịch vụ ID:</strong> {treatment.serviceId}</p>
                              <p><strong>Ghi chú:</strong> {treatment.notes || 'Không có ghi chú'}</p>
                              <p><strong>Tạo lúc:</strong> {formatDateTimeVN(treatment.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="appointments-tab">
                <div className="tab-header">
                  <h3>Lịch sử lịch hẹn</h3>
                  <button className="btn btn-primary">➕ Đặt lịch mới</button>
                </div>
                {tabLoading.appointments ? (
                  <div className="tab-loading">Đang tải...</div>
                ) : (
                  <div className="appointments-list">
                    {tabData.appointments.map(appointment => (
                      <div key={appointment.id} className="appointment-card">
                        <div className="appointment-info">
                          <h4>{appointment.serviceName}</h4>
                          <p><strong>Ngày:</strong> {formatDateTimeVN(appointment.date)}</p>
                          <p><strong>Kỹ thuật viên:</strong> {appointment.technician}</p>
                        </div>
                        <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                          {appointment.status === 'COMPLETED' ? 'Hoàn thành' : appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="financial-tab">
                <div className="tab-header">
                  <h3>Lịch sử giao dịch</h3>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateInvoice}
                  >
                    ➕ Tạo hóa đơn
                  </button>
                </div>
                {tabLoading.financial ? (
                  <div className="tab-loading">Đang tải...</div>
                ) : (
                  <div className="financial-list">
                    {tabData.financial.length === 0 ? (
                      <div className="no-financial">
                        <div className="no-financial-icon">💰</div>
                        <p>Chưa có giao dịch nào</p>
                        <button
                          className="btn btn-primary"
                          onClick={handleCreateInvoice}
                        >
                          Tạo hóa đơn đầu tiên
                        </button>
                      </div>
                    ) : (
                      tabData.financial.map(transaction => {
                        const getTransactionIcon = (type) => {
                          return type === 'INVOICE' ? '📄' : '💳';
                        };

                        const getStatusBadge = (type, status) => {
                          if (type === 'INVOICE') {
                            const statusMap = {
                              'DRAFT': 'status-draft',
                              'UNPAID': 'status-unpaid',
                              'PAID': 'status-paid',
                              'OVERDUE': 'status-overdue',
                              'CANCELLED': 'status-cancelled'
                            };
                            return (
                              <span className={`status-badge ${statusMap[status] || 'status-default'}`}>
                                {status === 'PAID' ? 'Đã thanh toán' :
                                  status === 'UNPAID' ? 'Chưa thanh toán' :
                                    status === 'DRAFT' ? 'Nháp' :
                                      status === 'OVERDUE' ? 'Quá hạn' :
                                        status === 'CANCELLED' ? 'Đã hủy' : status}
                              </span>
                            );
                          } else {
                            return (
                              <span className="status-badge status-payment">
                                Đã thanh toán
                              </span>
                            );
                          }
                        };

                        return (
                          <div key={transaction.id} className="transaction-card">
                            <div className="transaction-info">
                              <div className="transaction-header">
                                <span className="transaction-icon">{getTransactionIcon(transaction.type)}</span>
                                <h4>{transaction.description}</h4>
                                {getStatusBadge(transaction.type, transaction.status)}
                              </div>
                              <p><strong>Ngày:</strong> {formatDateTimeVN(transaction.date)}</p>
                              {transaction.pointsEarned && (
                                <p><strong>Điểm được:</strong> +{transaction.pointsEarned} điểm</p>
                              )}
                            </div>
                            <div className={`transaction-amount ${transaction.type === 'INVOICE' ? 'invoice-amount' : 'payment-amount'}`}>
                              {transaction.type === 'INVOICE' ? '-' : '+'}{formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="photos-tab">
                <div className="tab-header">
                  <h3>Thư viện ảnh</h3>
                  <button className="btn btn-primary">➕ Thêm ảnh</button>
                </div>
                {tabLoading.photos ? (
                  <div className="tab-loading">Đang tải...</div>
                ) : (
                  <div className="photos-gallery">
                    {tabData.photos.length === 0 ? (
                      <div className="no-photos">
                        <div className="no-photos-icon">📸</div>
                        <p>Chưa có ảnh nào</p>
                      </div>
                    ) : (
                      tabData.photos.map(photo => (
                        <div key={photo.id} className="photo-card">
                          <h4>{photo.serviceName}</h4>
                          <div className="photo-comparison">
                            <div className="photo-item">
                              <label>Trước</label>
                              <img src={photo.beforePhoto} alt="Before" />
                            </div>
                            <div className="photo-item">
                              <label>Sau</label>
                              <img src={photo.afterPhoto} alt="After" />
                            </div>
                          </div>
                          <p className="photo-date">{formatDateTimeVN(photo.date)}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Case Creation Modal */}
      <CustomerCaseCreationModal
        isOpen={showCaseCreationModal}
        onClose={handleCloseCaseCreationModal}
        onCaseCreated={handleCaseCreated}
        customerId={customerId}
        customerName={customer?.fullName}
      />

      {/* Invoice Creation Modal */}
      <InvoiceCreationModal
        isOpen={showInvoiceCreationModal}
        onClose={handleCloseInvoiceCreationModal}
        onInvoiceCreated={handleInvoiceCreated}
        customerId={customerId}
        customerName={customer?.fullName}
      />
    </div>
  );
};

export default CustomerDetailModal;
