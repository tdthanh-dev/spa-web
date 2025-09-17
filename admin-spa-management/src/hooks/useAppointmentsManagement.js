import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  appointmentsService,
  servicesService,
  customersService,
  leadsService
} from '@/services';
import { useSort } from '@/hooks/useSort';

/**
 * Custom hook for Appointments Management logic
 * Handles all business logic, state management, and API calls
 */
export const useAppointmentsManagement = () => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');

  // Data state
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
  });

  // Services and customers for dropdowns
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Initialize data fetching
  useEffect(() => {
    fetchData();
    fetchServices();
    fetchCustomers();

    // Check if we have a leadId parameter to auto-open appointment creation
    if (leadId) {
      fetchLeadAndOpenModal(leadId);
    }
  }, [sort, pagination, leadId]);

  /**
   * Fetch appointments data from API
   */
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

  /**
   * Fetch services for dropdown
   */
  const fetchServices = async () => {
    try {
      const response = await servicesService.getActive();
      setServices(response?.content || []);
    } catch (error) {
      console.error('Fetch services error:', error);
    }
  };

  /**
   * Fetch customers for dropdown
   */
  const fetchCustomers = async () => {
    try {
      const response = await customersService.getAll({ size: 100 });
      setCustomers(response?.content || []);
    } catch (error) {
      console.error('Fetch customers error:', error);
    }
  };

  /**
   * Fetch lead data and open modal for appointment creation
   */
  const fetchLeadAndOpenModal = async (leadId) => {
    try {
      await leadsService.getById(leadId);
      setModalState({
        isOpen: true
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
    }
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (newSize) => {
    setPagination({ page: 0, size: newSize });
  };

  /**
   * Open create appointment modal
   */
  const handleCreateAppointment = () => {
    setModalState({
      isOpen: true
    });
  };

  /**
   * Close modal
   */
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
    });
  };

  /**
   * Handle appointment creation success
   */
  const handleAppointmentCreated = () => {
    fetchData();
    handleCloseModal();
  };

  /**
   * Get status badge configuration
   */
  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': { label: 'Đã đặt', className: 'status-scheduled' },
      'CONFIRMED': { label: 'Đã xác nhận', className: 'status-confirmed' },
      'NO_SHOW': { label: 'Không đến', className: 'status-no-show' },
      'DONE': { label: 'Hoàn thành', className: 'status-done' },
      'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
    };

    return statusMap[status] || { label: status, className: 'status-default' };
  };

  /**
   * Calculate statistics from appointments data
   */
  const getStatistics = () => {
    const appointments = data.appointments;
    return {
      total: data.totalElements,
      scheduled: appointments.filter(apt => apt.status === 'SCHEDULED').length,
      confirmed: appointments.filter(apt => apt.status === 'CONFIRMED').length,
      done: appointments.filter(apt => apt.status === 'DONE').length
    };
  };

  // Return all state and functions needed by the UI component
  return {
    // State
    data,
    sort,
    pagination,
    modalState,
    services,
    customers,

    // Actions
    fetchData,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleCreateAppointment,
    handleCloseModal,
    handleAppointmentCreated,

    // Utilities
    getStatusBadge,
    getStatistics,

    // Computed values
    statistics: getStatistics(),
    hasAppointments: data.appointments.length > 0,
    showPagination: data.totalPages > 1
  };
};