import React, { useState, useEffect } from 'react';
import { leadsService } from '@/services';
import { getRelativeTime, formatDateTimeVN } from '@/utils/dateUtils';
import { getStatusInfo, getCustomerType, getCustomerTypeStatus, truncateText } from '@/utils/formatters';
import { APP_CONFIG } from '@/config/constants';
import { Pagination, SortableHeader, useSort } from '@/components/common/CommonComponents';
import RequestDetailModalV2 from '@/components/RequestDetailModal/RequestDetailModalV2';
import './ConsultationDashboard.css';

const ConsultationDashboard = () => {
  
  const [data, setData] = useState({
    requests: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
    loading: true,
    error: null
  });

  // Sorting state
  const { sort, handleSort } = useSort({ sortBy: 'leadId', sortDir: 'desc' });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20
  });

  // Thống kê
  const [statistics, setStatistics] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    won: 0,
    lost: 0
  });

  // Filter state
  const [statusFilter, setStatusFilter] = useState(null);

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    selectedRequest: null
  });

  // Single useEffect to handle all data fetching
  useEffect(() => {
    fetchData();
  }, [statusFilter, sort, pagination]);

  // Handle pagination change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination({ page: 0, size: newSize });
  };

  // Modal handlers
  const handleViewRequest = (request) => {
    setModalState({
      isOpen: true,
      selectedRequest: request
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      selectedRequest: null
    });
  };

  const handleCreateCustomer = (customerData) => {
    // TODO: Implement customer creation API call
    // After successful creation, refresh the data
    fetchData();
  };

  const handleCreateAppointment = (request, customerData) => {
    // Navigate to appointments management page with pre-filled data
    window.location.href = '/receptionist/appointments?leadId=' + request.leadId;
  };

  const handleStartConsultation = async (request) => {
    try {
      // Update status to IN_PROGRESS
      await leadsService.updateLeadStatus(request.leadId, 'IN_PROGRESS', 'Bắt đầu tư vấn khách hàng');

      // Create updated request object with new status
      const updatedRequest = { ...request, status: 'IN_PROGRESS' };

      // Open modal with updated request
      handleViewRequest(updatedRequest);

    } catch (error) {
      // Could show error toast/message here
    }
  };

  const handleViewCustomerProfile = (customerId) => {
    // Navigate to customer profile page based on current user role
    const currentPath = window.location.pathname;
    let profilePath = `/customers/${customerId}`;

    if (currentPath.includes('/admin/')) {
      profilePath = `/admin${profilePath}`;
    } else if (currentPath.includes('/technician/')) {
      profilePath = `/technician${profilePath}`;
    } else {
      profilePath = `/receptionist${profilePath}`;
    }

    window.open(profilePath, '_blank');
  };

  // Status filter handlers
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    // Reset pagination when filter changes
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleClearFilter = () => {
    setStatusFilter(null);
    // Reset pagination when clearing filter
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      let response;
      
      // Use dedicated status API if filtering by status
      if (statusFilter && statusFilter !== null) {
        response = await leadsService.getByStatus(statusFilter, {
          page: pagination.page,
          size: pagination.size,
          sortBy: sort.sortBy || 'leadId',
          sortDir: sort.sortDir || 'desc'
        });
      } else {
        response = await leadsService.getAll({
          page: pagination.page,
          size: pagination.size,
          sortBy: sort.sortBy || 'leadId',
          sortDir: sort.sortDir || 'desc'
        });
      }

      // New API structure: response contains content directly
      const requests = response?.content || [];

      // Simplified statistics calculation
      const stats = {
        total: response?.totalElements || 0,
        new: requests.filter(req => req.status === 'NEW').length,
        inProgress: requests.filter(req => req.status === 'IN_PROGRESS').length,
        won: requests.filter(req => req.status === 'WON').length,
        lost: requests.filter(req => req.status === 'LOST').length
      };

      setData({
        requests,
        totalElements: response?.totalElements || 0,
        totalPages: response?.totalPages || 0,
        currentPage: response?.number || 0,
        pageSize: response?.size || pagination.size,
        loading: false,
        error: null
      });

      setStatistics(stats);
    } catch (error) {
      let errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại sau.';

      if (error.response?.status === 401) {
        // Don't set error message here, let the interceptor handle logout
        return;
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập dữ liệu này.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng liên hệ quản trị viên.';
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'Không thể kết nối tới server. Kiểm tra kết nối mạng.';
      }

      setData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  const StatusBadge = ({ status }) => {
    const statusInfo = getStatusInfo(status);
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Test render - always show something
  if (data.loading) {
    return (
      <div className="consultation-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="consultation-dashboard">
        <div className="error-container">
          <h2><span className="icon icon-warning"></span> Có lỗi xảy ra</h2>
          <p>{data.error}</p>
          <button className="retry-button" onClick={fetchData}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="consultation-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Yêu cầu tư vấn</h1>
        {statusFilter && (
          <div className="active-filter">
            <span className="filter-text">
              {
                statusFilter === 'NEW' ? 'Mới' :
                statusFilter === 'IN_PROGRESS' ? 'Đang tư vấn' :
                statusFilter === 'WON' ? 'Thành công' :
                statusFilter === 'LOST' ? 'Thất bại' :
                statusFilter
              }
            </span>
            <button className="clear-filter-button" onClick={handleClearFilter}>
              <span className="icon icon-close"></span>
            </button>
          </div>
        )}
        <button className="refresh-button" onClick={fetchData}>
          <span className="icon icon-refresh"></span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="statistics-grid">
        <div
          className={`stat-card total ${statusFilter === null ? 'active' : ''}`}
          onClick={() => handleClearFilter()}
          style={{ cursor: 'pointer' }}
          title="Xem tất cả yêu cầu"
        >
          <div className="stat-icon">
            <span className="icon icon-dashboard"></span>
          </div>
          <div className="stat-content">
            <h3>Tổng</h3>
          </div>
        </div>

        <div
          className={`stat-card new ${statusFilter === 'NEW' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('NEW')}
          style={{ cursor: 'pointer' }}
          title="Xem yêu cầu mới"
        >
          <div className="stat-icon">
            <span className="icon icon-plus"></span>
          </div>
          <div className="stat-content">
            <h3>Mới</h3>
          </div>
        </div>

        <div
          className={`stat-card in-progress ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('IN_PROGRESS')}
          style={{ cursor: 'pointer' }}
          title="Xem yêu cầu đang tư vấn"
        >
          <div className="stat-icon">
            <span className="icon icon-chat"></span>
          </div>
          <div className="stat-content">
            <h3>Đang tư vấn</h3>
          </div>
        </div>

        <div
          className={`stat-card success ${statusFilter === 'WON' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('WON')}
          style={{ cursor: 'pointer' }}
          title="Xem yêu cầu thành công"
        >
          <div className="stat-icon">
            <span className="icon icon-check"></span>
          </div>
          <div className="stat-content">
            <h3>Thành công</h3>
          </div>
        </div>

        <div
          className={`stat-card lost ${statusFilter === 'LOST' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('LOST')}
          style={{ cursor: 'pointer' }}
          title="Xem yêu cầu thất bại"
        >
          <div className="stat-icon">
            <span className="icon icon-x"></span>
          </div>
          <div className="stat-content">
            <h3>Thất bại</h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Yêu cầu tư vấn ({data.requests.length})</h2>
          <div className="table-actions">
            <div className="table-info">
              {data.requests.length} / {data.totalElements} yêu cầu
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <SortableHeader
                  label="Khách hàng"
                  sortKey="fullName"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="SĐT"
                  sortKey="phone"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <th>Ghi chú</th>
                <th>Loại khách</th>
                <SortableHeader
                  label="Trạng thái"
                  sortKey="status"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Thời gian"
                  sortKey="createdAt"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.requests.length > 0 ? (
                data.requests.map((request, index) => {
                  return (
                    <tr key={request.leadId} className="data-row">
                      <td>{pagination.page * pagination.size + index + 1}</td>
                      <td className="customer-name">{request.fullName || 'N/A'}</td>
                      <td className="phone-number">{request.phone || 'N/A'}</td>
                      <td className="note">{truncateText(request.note, 30) || 'N/A'}</td>
                      <td className="customer-type">
                        <span className={`customer-type-badge ${request.customerId ? 'existing' : 'new'}`}>
                          {request.customerId ? 'Khách cũ' : 'Khách mới'}
                        </span>
                      </td>
                      <td className="status">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="datetime">
                        {request.createdAt ? (
                          <span className="time-badge">
                            {formatDateTimeVN(request.createdAt)}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="actions">
                        {/* Dynamic button based on status */}
                        {request.status === 'NEW' && (
                          <button
                            className="action-button consult"
                            title="Bắt đầu tư vấn"
                            onClick={() => handleStartConsultation(request)}
                          >
                            <span className="icon icon-chat"></span> Tư vấn
                          </button>
                        )}

                        {request.status === 'IN_PROGRESS' && (
                          <button
                            className="action-button details"
                            title="Xem chi tiết"
                            onClick={() => handleViewRequest(request)}
                          >
                            <span className="icon icon-details"></span> Chi tiết
                          </button>
                        )}

                        {request.status === 'WON' && request.customerId && (
                          <button
                            className="action-button profile"
                            title="Xem hồ sơ khách hàng"
                            onClick={() => handleViewCustomerProfile(request.customerId)}
                          >
                            <span className="icon icon-profile"></span> Hồ sơ
                          </button>
                        )}

                        {request.status === 'LOST' && (
                          <button
                            className="action-button lost"
                            title="Yêu cầu thất bại"
                            onClick={() => handleViewRequest(request)}
                          >
                            <span className="icon icon-error"></span> Thất bại
                          </button>
                        )}

                        {/* Additional action buttons */}
                        <button
                          className="action-button edit"
                          title="Chỉnh sửa"
                          onClick={() => handleViewRequest(request)}
                        >
                          <span className="icon icon-edit"></span> Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-content">
                      <div className="no-data-icon icon-document"></div>
                      <p>Chưa có yêu cầu tư vấn nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <Pagination
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            pageSize={data.pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            disabled={data.loading}
          />
        )}
      </div>

      {/* Request Detail Modal */}
      <RequestDetailModalV2
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        request={modalState.selectedRequest}
        onCreateCustomer={handleCreateCustomer}
        onCreateAppointment={handleCreateAppointment}
      />
    </div>
  );
};

export default ConsultationDashboard;