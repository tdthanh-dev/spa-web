import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  appointmentsService, 
  servicesService, 
  customersService, 
  leadsService 
} from '@/services';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { Pagination, SortableHeader, useSort } from '@/components/common/CommonComponents';
import CreateAppointmentModal from '@/components/Appointment/CreateAppointmentModal';
import './AppointmentsManagement.css';

const AppointmentsManagement = () => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  
  const [data, setData] = useState({
    appointments: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 20,
    loading: true,
    error: null
  });

  // Sorting state
  const { sort, handleSort } = useSort({ sortBy: 'appointmentId', sortDir: 'desc' });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20
  });

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    selectedLead: null
  });

  // Services and customers for dropdowns
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchData();
    fetchServices();
    fetchCustomers();
    
    // Check if we have a leadId parameter to auto-open appointment creation
    if (leadId) {
      fetchLeadAndOpenModal(leadId);
    }
  }, [sort, pagination, leadId]);

  const fetchLeadAndOpenModal = async (leadId) => {
    try {
      const lead = await leadsService.getById(leadId);
      setSelectedLead(lead);
      setModalState({
        isOpen: true,
        selectedLead: lead
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
    }
  };

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const response = await appointmentsService.getAll({
        page: pagination.page,
        size: pagination.size,
        sortBy: sort.sortBy || 'appointmentId',
        sortDir: sort.sortDir || 'desc'
      });

      setData({
        appointments: response?.content || [],
        totalElements: response?.totalElements || 0,
        totalPages: response?.totalPages || 0,
        currentPage: response?.number || 0,
        pageSize: response?.size || pagination.size,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Fetch appointments error:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Không thể tải dữ liệu lịch hẹn'
      }));
    }
  };

  const fetchServices = async () => {
    try {
      const response = await servicesService.getActive();
      setServices(response?.content || []);
    } catch (error) {
      console.error('Fetch services error:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersService.getAll({ size: 100 });
      setCustomers(response?.content || []);
    } catch (error) {
      console.error('Fetch customers error:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination({ page: 0, size: newSize });
  };

  const handleCreateAppointment = (lead = null) => {
    setModalState({
      isOpen: true,
      selectedLead: lead
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      selectedLead: null
    });
  };

  const handleAppointmentCreated = () => {
    fetchData();
    handleCloseModal();
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': { label: 'Đã đặt', className: 'status-scheduled' },
      'CONFIRMED': { label: 'Đã xác nhận', className: 'status-confirmed' },
      'NO_SHOW': { label: 'Không đến', className: 'status-no-show' },
      'DONE': { label: 'Hoàn thành', className: 'status-done' },
      'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
    
    return (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (data.loading) {
    return (
      <div className="appointments-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="appointments-management">
        <div className="error-container">
          <h2>⚠️ Có lỗi xảy ra</h2>
          <p>{data.error}</p>
          <button className="retry-button" onClick={fetchData}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-management">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Quản lý lịch hẹn</h1>
        <div className="header-actions">
          <button className="refresh-button" onClick={fetchData}>
            <span className="refresh-icon">🔄</span>
            Làm mới
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleCreateAppointment()}
          >
            <span className="add-icon">➕</span>
            Tạo lịch hẹn
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="statistics-grid">
        <div className="stat-card total">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Tổng lịch hẹn</h3>
            <div className="stat-number">{data.totalElements}</div>
          </div>
        </div>

        <div className="stat-card scheduled">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Đã đặt</h3>
            <div className="stat-number">
              {data.appointments.filter(apt => apt.status === 'SCHEDULED').length}
            </div>
          </div>
        </div>

        <div className="stat-card confirmed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Đã xác nhận</h3>
            <div className="stat-number">
              {data.appointments.filter(apt => apt.status === 'CONFIRMED').length}
            </div>
          </div>
        </div>

        <div className="stat-card done">
          <div className="stat-icon">🎉</div>
          <div className="stat-content">
            <h3>Hoàn thành</h3>
            <div className="stat-number">
              {data.appointments.filter(apt => apt.status === 'DONE').length}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Danh sách lịch hẹn ({data.appointments.length})</h2>
          <div className="table-actions">
            <div className="table-info">
              {data.appointments.length} / {data.totalElements} lịch hẹn
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
                  sortKey="customerId"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Dịch vụ"
                  sortKey="serviceId"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Thời gian bắt đầu"
                  sortKey="startAt"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Thời gian kết thúc"
                  sortKey="endAt"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Trạng thái"
                  sortKey="status"
                  currentSort={sort}
                  onSort={handleSort}
                />
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.length > 0 ? (
                data.appointments.map((appointment, index) => (
                  <tr key={appointment.appointmentId} className="data-row">
                    <td>{pagination.page * pagination.size + index + 1}</td>
                    <td className="customer-name">
                      {appointment.customer?.fullName || 'N/A'}
                    </td>
                    <td className="service-name">
                      {appointment.service?.name || 'N/A'}
                    </td>
                    <td className="datetime">
                      {appointment.startAt ? (
                        <span className="time-badge">
                          {formatDateTimeVN(appointment.startAt)}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="datetime">
                      {appointment.endAt ? (
                        <span className="time-badge">
                          {formatDateTimeVN(appointment.endAt)}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="status">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="note">
                      {appointment.notes || 'N/A'}
                    </td>
                    <td className="actions">
                      <button 
                        className="action-button view" 
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-button edit" 
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-button cancel" 
                        title="Hủy lịch hẹn"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    <div className="no-data-content">
                      <div className="no-data-icon">📅</div>
                      <p>Chưa có lịch hẹn nào</p>
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

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onAppointmentCreated={handleAppointmentCreated}
        lead={modalState.selectedLead}
        services={services}
        customers={customers}
      />
    </div>
  );
};

export default AppointmentsManagement;
