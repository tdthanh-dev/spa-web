// filepath: admin-spa-management/src/pages/customers/CustomerList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersService } from '@/services';
import { formatDateTimeVN } from '@/utils/dateUtils';
import CustomerCreationModal from '@/components/Customer/CustomerCreationModal';
import CustomerDetailModal from '@/components/Customer/CustomerDetailModal';
import './CustomerList.css';

/**
 * Customer List Component - Displays spa customers with search and filtering
 * Accessible by all roles with different permissions
 */
const CustomerList = ({ userRole }) => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    customers: [],
    totalElements: 0,
    loading: true,
    error: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const params = {
        page: currentPage,
        size: 20,
        sortBy: 'customerId',
        sortDir: 'desc'
      };

      const response = searchTerm 
        ? await customersService.search(searchTerm, params)
        : await customersService.getAll(params);

      console.log('API Response:', response); // Debug log

      // CustomersService returns Spring Page object directly
      if (response && response.content) {
        console.log('Customers data:', response); // Debug log
        setData({
          customers: response.content || [],
          totalElements: response.totalElements || 0,
          loading: false,
          error: null
        });
      } else {
        console.error('Response structure:', response); // Debug log
        throw new Error('Invalid response format - missing content field');
      }

    } catch (error) {
      console.error('Error fetching customers:', error);
      
      let errorMessage = 'Không thể tải danh sách khách hàng. Vui lòng thử lại.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập chức năng này.';
      }
      
      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page
    fetchCustomers();
  };

  const handleCustomerClick = async (customerId) => {
    try {
      const customer = await customersService.getById(customerId);
      // CustomersService returns customer object directly
      if (customer && customer.customerId) {
        setSelectedCustomer(customer);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleViewProfile = (customerId) => {
    // Navigate to customer profile page based on current role
    const rolePath = userRole.toLowerCase();
    navigate(`/${rolePath}/customers/${customerId}`);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCustomerCreated = (newCustomer) => {
    console.log('New customer created:', newCustomer);
    // Refresh the customer list
    fetchCustomers();
    setShowCreateModal(false);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCustomerId(null);
  };

  const handleEditCustomer = (customer) => {
    // TODO: Implement customer editing functionality
    console.log('Edit customer:', customer);
    // For now, just close the detail modal and open edit modal
    setShowDetailModal(false);
    // Would open edit modal here
  };

  const getCustomerTypeLabel = (customer) => {
    if (customer.isVip) return 'VIP';
    if ((customer.totalSpent || 0) > 0) return 'Khách cũ';
    return 'Khách mới';
  };

  if (data.loading) {
    return (
      <div className="customer-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách khách hàng...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="customer-list">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{data.error}</p>
          <button className="retry-button" onClick={fetchCustomers}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-list">
      {/* Header */}
      <div className="list-header">
        <h1>👥 Quản lý Khách hàng</h1>
        <div className="header-actions">
          {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
            <button 
              className="btn btn-primary"
              onClick={handleOpenCreateModal}
            >
              ➕ Thêm khách hàng
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍 Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Statistics */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{data.totalElements}</div>
          <div className="stat-label">Tổng khách hàng</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {data.customers.filter(c => c.isVip === true).length}
          </div>
          <div className="stat-label">Khách VIP</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {data.customers.filter(c => (c.totalSpent || 0) > 0).length}
          </div>
          <div className="stat-label">Đã chi tiêu</div>
        </div>
      </div>

      {/* Customer List */}
      <div className="customers-container">
        {data.customers.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">👥</div>
            <p>Không tìm thấy khách hàng nào</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="customer-table-header">
              <div className="sortable">👤 Tên khách hàng</div>
              <div className="sortable">📞 Số điện thoại</div>
              <div className="sortable">📧 Email</div>
              <div className="sortable">🏷️ Loại</div>
              <div className="sortable">💎 Tier</div>
              <div className="sortable">💰 Chi tiêu</div>
              <div className="sortable">⭐ Điểm</div>
              <div>🔧 Thao tác</div>
            </div>

            {/* Customer Rows */}
            {data.customers.map((customer) => {
              const getCustomerRowClass = (customer) => {
                if (customer.isVip) return 'vip';
                if ((customer.totalSpent || 0) > 0) return 'returning';
                return 'new';
              };

              const getTierBadge = (tierName) => {
                if (!tierName) return { class: 'bronze', label: 'Bronze' };
                const tier = tierName.toLowerCase();
                if (tier.includes('diamond')) return { class: 'diamond', label: 'Diamond' };
                if (tier.includes('platinum')) return { class: 'platinum', label: 'Platinum' };
                if (tier.includes('gold')) return { class: 'gold', label: 'Gold' };
                if (tier.includes('silver')) return { class: 'silver', label: 'Silver' };
                return { class: 'bronze', label: 'Bronze' };
              };

              const tierInfo = getTierBadge(customer.tierName);
              
              return (
                <div 
                  key={customer.customerId} 
                  className={`customer-row ${getCustomerRowClass(customer)}`}
                  onClick={() => handleCustomerClick(customer.customerId)}
                >
                  <div className="customer-name">
                    {customer.isVip && <span className="vip-icon">👑</span>}
                    {customer.fullName}
                  </div>
                  
                  <div className="customer-phone">{customer.phone}</div>
                  
                  <div className="customer-email">{customer.email || 'Chưa có'}</div>
                  
                  <div className="customer-type">
                    <span className={`customer-type-badge ${getCustomerRowClass(customer)}`}>
                      {getCustomerTypeLabel(customer)}
                    </span>
                  </div>
                  
                  <div className="customer-tier">
                    <span className={`tier-badge ${tierInfo.class}`}>
                      {tierInfo.label}
                    </span>
                  </div>
                  
                  <div className="customer-spent">
                    {customer.totalSpent ? `${customer.totalSpent.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
                  </div>
                  
                  <div className="customer-points">
                    {customer.totalPoints || 0} điểm
                  </div>
                  
                  <div className="customer-actions">
                    <button 
                      className="action-btn view"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(customer.customerId);
                      }}
                      title="Xem profile khách hàng"
                    >
                      👁️ Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {data.totalElements > 20 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            ← Trang trước
          </button>
          <span className="pagination-info">
            Trang {currentPage + 1} / {Math.ceil(data.totalElements / 20)}
          </span>
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={(currentPage + 1) * 20 >= data.totalElements}
            className="pagination-btn"
          >
            Trang sau →
          </button>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết khách hàng</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedCustomer(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Tên:</strong> {selectedCustomer.fullName}</p>
              <p><strong>SĐT:</strong> {selectedCustomer.phone}</p>
              <p><strong>Email:</strong> {selectedCustomer.email || 'Chưa có'}</p>
              <p><strong>Địa chỉ:</strong> {selectedCustomer.address || 'Chưa có'}</p>
              <p><strong>Ghi chú:</strong> {selectedCustomer.notes || 'Không có'}</p>
              <p><strong>Tier:</strong> {selectedCustomer.tierName || 'Chưa có'}</p>
              <p><strong>Tổng chi tiêu:</strong> {selectedCustomer.totalSpent ? `${selectedCustomer.totalSpent.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}</p>
              <p><strong>Điểm tích lũy:</strong> {selectedCustomer.totalPoints || 0} điểm</p>
              <p><strong>VIP:</strong> {selectedCustomer.isVip ? 'Có' : 'Không'}</p>
              <p>Sử dụng "👁️ Profile" để xem chi tiết đầy đủ</p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Creation Modal */}
      <CustomerCreationModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        customerId={selectedCustomerId}
        onEdit={handleEditCustomer}
        userRole={userRole}
      />
    </div>
  );
};

export default CustomerList;
