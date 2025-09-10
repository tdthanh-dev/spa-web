import React, { useState, useEffect } from 'react';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { getStatusInfo } from '@/utils/formatters';
import { customersService, leadsService } from '@/services';
import CustomerCreationModal from '@/components/Customer/CustomerCreationModal';
import './RequestDetailModalV2.css';

const RequestDetailModalV2 = ({ 
  isOpen, 
  onClose, 
  request,
  onCreateCustomer,
  onCreateAppointment
}) => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // info, history, actions

  // Modal states
  const [showCustomerCreationModal, setShowCustomerCreationModal] = useState(false);

  // Status update state
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'NEW',
    note: ''
  });

  useEffect(() => {
    if (isOpen && request) {
      if (request.customerId) {
        // Fetch existing customer data
        fetchCustomerData(request.customerId);
      }

      // Set initial status - sync with current request status
      setStatusUpdate(prev => ({
        ...prev,
        status: request.status || 'NEW'
      }));

      // Clear any previous errors
      setError(null);
    }
  }, [isOpen, request]);

  const fetchCustomerData = async (customerId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customersService.getById(customerId);
      setCustomerData(response);
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError('Không thể tải thông tin khách hàng');
      setLoading(false);
    }
  };

  const handleOpenCustomerCreationModal = () => {
    setShowCustomerCreationModal(true);
  };

  const handleCloseCustomerCreationModal = () => {
    setShowCustomerCreationModal(false);
  };

  const handleCustomerCreated = async (customerResponse) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Customer created successfully:', customerResponse);
      
      // Update lead status to WON (successful conversion)
      await leadsService.updateLeadStatus(request.leadId, 'WON', `Converted to customer ID: ${customerResponse.customerId}`);
      
      if (onCreateCustomer) {
        onCreateCustomer(customerResponse);
      }
      
      // Close both modals
      setShowCustomerCreationModal(false);
      onClose();
      
    } catch (err) {
      console.error('Error updating lead after customer creation:', err);
      setError('Khách hàng được tạo thành công nhưng không thể cập nhật yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      setError(null);

      await leadsService.updateLeadStatus(request.leadId, statusUpdate.status);

      // Refresh request data
      if (onCreateCustomer) {
        onCreateCustomer(); // This will trigger a refresh
      }

      setLoading(false);

    } catch (err) {
      console.error('Error updating status:', err);
      setError('Không thể cập nhật trạng thái');
      setLoading(false);
    }
  };


  const handleCreateAppointment = () => {
    if (onCreateAppointment) {
      onCreateAppointment(request, customerData);
    }
    onClose();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'NEW': { label: 'Mới', className: 'status-new', color: '#007bff' },
      'IN_PROGRESS': { label: 'Đang xử lý', className: 'status-in-progress', color: '#fd7e14' },
      'WON': { label: 'Thành công', className: 'status-won', color: '#28a745' },
      'LOST': { label: 'Thất bại', className: 'status-lost', color: '#dc3545' }
    };

    const statusInfo = statusMap[status] || { label: status, className: 'status-default', color: '#6c757d' };

    return (
      <span
        className={`status-badge ${statusInfo.className}`}
        style={{ backgroundColor: statusInfo.color }}
      >
        {statusInfo.label}
      </span>
    );
  };

  const getCustomerTypeBadge = (isExisting) => {
    if (isExisting) {
      return (
        <span className="customer-type-badge existing">
          Khách cũ
        </span>
      );
    } else {
      return (
        <span className="customer-type-badge new">
          Khách mới
        </span>
      );
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className={`modal-overlay ${isFullscreen ? 'fullscreen' : ''}`} onClick={onClose}>
      <div 
        className={`modal-content request-detail-modal-v2 ${isFullscreen ? 'fullscreen' : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <h2>Chi tiết yêu cầu tư vấn</h2>
            <span className="lead-id">#{request.leadId}</span>
          </div>
          <div className="header-right">
            <button
              className="fullscreen-toggle"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
            >
              <span className={`icon ${isFullscreen ? 'icon-minimize' : 'icon-maximize'}`}></span>
            </button>
            <button className="close-button" onClick={onClose}>
              <span className="icon icon-close"></span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-body">
          {error && (
            <div className="error-message">
              <span className="error-icon icon-warning"></span>
              {error}
            </div>
          )}

          <div className="content-grid">
            {/* Left Column - Customer Information */}
            <div className="left-column">
              <div className="section">
                <h3>Thông tin khách hàng</h3>
                
                {request.customerId ? (
                  // Existing Customer
                  <div className="customer-info">
                    {loading ? (
                      <div className="loading">Đang tải thông tin khách hàng...</div>
                    ) : customerData ? (
                      <>
                        <div className="info-item">
                          <label>Tên khách hàng:</label>
                          <span className="customer-name">{customerData.fullName}</span>
                        </div>
                        <div className="info-item">
                          <label>Số điện thoại:</label>
                          <span className="phone-number">{customerData.phone}</span>
                        </div>
                        <div className="info-item">
                          <label>Email:</label>
                          <span>{customerData.email || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="info-item">
                          <label>Loại khách:</label>
                          {getCustomerTypeBadge(true)}
                        </div>
                        
                        {customerData.isVip && (
                          <div className="vip-badge">
                            <span className="vip-icon icon-crown"></span>
                            VIP Customer
                          </div>
                        )}
                        
                        <div className="customer-stats">
                          <div className="stat-item">
                            <label>Tổng chi tiêu:</label>
                            <span className="total-spent">
                              {customerData.totalSpent?.toLocaleString('vi-VN') || 0} VNĐ
                            </span>
                          </div>
                          <div className="stat-item">
                            <label>Tổng điểm:</label>
                            <span className="total-points">
                              {customerData.totalPoints || 0} điểm
                            </span>
                          </div>
                          <div className="stat-item">
                            <label>Tier:</label>
                            <span className="tier-badge">
                              {customerData.tierName || 'Standard'}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => {
                            const currentPath = window.location.pathname;
                            let profilePath = `/customers/${customerData.customerId}`;

                            if (currentPath.includes('/admin/')) {
                              profilePath = `/admin${profilePath}`;
                            } else if (currentPath.includes('/technician/')) {
                              profilePath = `/technician${profilePath}`;
                            } else {
                              profilePath = `/receptionist${profilePath}`;
                            }

                            window.open(profilePath, '_blank');
                          }}
                        >
                          Mở hồ sơ khách hàng
                        </button>
                      </>
                    ) : (
                      <div className="error">Không thể tải thông tin khách hàng</div>
                    )}
                  </div>
                ) : (
                  // New Customer Creation
                  <div className="new-customer-creation">
                    <div className="customer-type-section">
                      <h4>Khách hàng mới</h4>
                      <p>Tạo hồ sơ khách hàng từ yêu cầu tư vấn này</p>
                      
                      <div className="new-customer-preview">
                        <div className="preview-info">
                          <div className="preview-item">
                            <span className="label">Tên:</span>
                            <span className="value">{request.fullName}</span>
                          </div>
                          <div className="preview-item">
                            <span className="label">SĐT:</span>
                            <span className="value">{request.phone}</span>
                          </div>
                          {request.note && (
                            <div className="preview-item">
                              <span className="label">Ghi chú:</span>
                              <span className="value">{request.note}</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          className="btn btn-primary create-customer-btn"
                          onClick={handleOpenCustomerCreationModal}
                          disabled={loading}
                        >
                          <span className="icon icon-add"></span> Tạo khách hàng
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Request Information & Actions */}
            <div className="right-column">
              <div className="section">
                <h3>Thông tin yêu cầu</h3>
                x
                <div className="request-info">
                  <div className="info-item">
                    <label>Thời gian tạo:</label>
                    <span className="datetime">
                      {formatDateTimeVN(request.createdAt)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Ghi chú ban đầu:</label>
                    <div className="note-content">
                      {request.note || 'Không có ghi chú'}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái hiện tại:</label>
                    <div className="status-section">
                      {getStatusBadge(request.status)}
                      <select
                        value={statusUpdate.status}
                        onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                        className="status-select"
                      >
                        <option value="NEW">Mới</option>
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="WON">Thành công</option>
                        <option value="LOST">Thất bại</option>
                      </select>
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Loại khách:</label>
                    {getCustomerTypeBadge(request.isExistingCustomer)}
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="section">
                <h3>Thao tác</h3>
                <div className="actions-grid">
                  {/* Dynamic primary button based on status */}
                  {request.status === 'NEW' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setStatusUpdate(prev => ({ ...prev, status: 'IN_PROGRESS' }))}
                      disabled={loading}
                    >
                      <span className="icon icon-chat"></span> Tư vấn
                    </button>
                  )}

                  {request.status === 'IN_PROGRESS' && (
                    <button
                      className="btn btn-info"
                      onClick={() => {
                        // Scroll to details section
                        document.querySelector('.right-column')?.scrollIntoView({
                          behavior: 'smooth'
                        });
                      }}
                      disabled={loading}
                    >
                      <span className="icon icon-details"></span> Chi tiết
                    </button>
                  )}

                  {request.status === 'WON' && request.customerId && (
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        const currentPath = window.location.pathname;
                        let profilePath = `/customers/${request.customerId}`;

                        if (currentPath.includes('/admin/')) {
                          profilePath = `/admin${profilePath}`;
                        } else if (currentPath.includes('/technician/')) {
                          profilePath = `/technician${profilePath}`;
                        } else {
                          profilePath = `/receptionist${profilePath}`;
                        }

                        window.open(profilePath, '_blank');
                      }}
                      disabled={loading}
                    >
                      <span className="icon icon-profile"></span> Xem hồ sơ
                    </button>
                  )}

                  {/* Additional actions available in all states */}
                  {!request.customerId && request.status !== 'WON' && (
                    <button
                      className="btn btn-outline-success"
                      onClick={handleOpenCustomerCreationModal}
                      disabled={loading}
                    >
                      🆕 Tạo khách hàng
                    </button>
                  )}

                  <button
                    className="btn btn-outline-info"
                    onClick={handleCreateAppointment}
                    disabled={loading}
                  >
                    <span className="icon icon-calendar"></span> Tạo lịch hẹn
                  </button>

                  {/* Status update for manual changes */}
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleStatusUpdate}
                    disabled={loading || statusUpdate.status === request.status}
                  >
                    <span className="icon icon-refresh"></span> Cập nhật trạng thái
                  </button>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="section">
                <h3>Lịch sử xử lý</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">Yêu cầu được tạo</div>
                      <div className="timeline-time">{formatDateTimeVN(request.createdAt)}</div>
                      <div className="timeline-description">
                        Khách hàng {request.fullName} đã gửi yêu cầu tư vấn
                      </div>
                    </div>
                  </div>
                  
                  {request.updatedAt && request.updatedAt !== request.createdAt && (
                    <div className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Cập nhật lần cuối</div>
                        <div className="timeline-time">{formatDateTimeVN(request.updatedAt)}</div>
                        <div className="timeline-description">
                          Thông tin yêu cầu đã được cập nhật
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>

      {/* Customer Creation Modal */}
      <CustomerCreationModal
        isOpen={showCustomerCreationModal}
        onClose={handleCloseCustomerCreationModal}
        onCustomerCreated={handleCustomerCreated}
        leadData={request}
      />
    </div>
  );
};

export default RequestDetailModalV2;
