// filepath: src/services/appointmentsApi.js
import apiClient from './apiClient';
import { extractApiResponse } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/config/constants';

export const appointmentsApi = {
  /**
   * Get all appointments with pagination
   */
  async getAppointments(params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy = 'apptId',
      sortDir = 'desc'
    } = params;

    const response = await apiClient.get(API_ENDPOINTS.APPOINTMENTS, {
      params: { page, size, sortBy, sortDir }
    });
    return extractApiResponse(response);
  },

  /**
   * Get today's appointments
   */
  async getTodayAppointments(params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy = 'apptId',
      sortDir = 'desc'
    } = params;

    const response = await apiClient.get(`${API_ENDPOINTS.APPOINTMENTS}/today`, {
      params: { page, size, sortBy, sortDir }
    });
    return extractApiResponse(response);
  },

  /**
   * Get appointments by technician ID
   */
  async getTechnicianAppointments(technicianId, params = {}) {
    const {
      page = 0,
      size = 20
    } = params;

    const response = await apiClient.get(`${API_ENDPOINTS.APPOINTMENTS}/technician/${technicianId}`, {
      params: { page, size }
    });
    return extractApiResponse(response);
  },

  /**
   * Get appointments by date range (for calendar)
   */
  async getAppointmentsByDateRange(startDate, endDate, params = {}) {
    const {
      page = 0,
      size = 50
    } = params;

    const response = await apiClient.get(`${API_ENDPOINTS.APPOINTMENTS}/calendar`, {
      params: { startDate, endDate, page, size }
    });
    return extractApiResponse(response);
  },

  /**
   * Get all appointments for a customer
   * Note: Backend doesn't have GET /api/appointments/customer/{customerId} endpoint
   * This is a workaround using the general appointments endpoint
   */
  async getByCustomer(customerId, params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy = 'apptId',
      sortDir = 'desc'
    } = params;

    // TODO: Backend should add endpoint GET /api/appointments/customer/{customerId}
    // For now, we use a workaround: get all appointments and filter by customerId
    // This is inefficient but prevents the 404 error
    console.warn('getByCustomer() using workaround - backend endpoint needed for better performance');

    try {
      // Try to get all appointments (this might not work due to permission filtering)
      const allAppointmentsRes = await apiClient.get(API_ENDPOINTS.APPOINTMENTS, {
        params: { page, size: 100, sortBy, sortDir } // Get more to filter
      });

      const allAppointments = extractApiResponse(allAppointmentsRes);

      // Filter appointments by customerId
      // Note: This assumes appointment object has customerId field
      const customerAppointments = (allAppointments.content || []).filter(
        appointment => appointment.customerId === parseInt(customerId) ||
                       appointment.customer?.customerId === parseInt(customerId)
      );

      // Return filtered results in same format as backend pagination
      return {
        content: customerAppointments.slice(0, size), // Apply size limit
        totalElements: customerAppointments.length,
        totalPages: Math.ceil(customerAppointments.length / size),
        size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(customerAppointments.length / size) - 1
      };
    } catch (error) {
      console.error('Error getting appointments by customer:', error);
      // Return empty result to prevent crashes
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: page,
        first: true,
        last: true
      };
    }
  },

  /**
   * Tạo lịch hẹn mới cho khách hàng
   */
  async create(customerId, data) {
    const res = await apiClient.post(`${API_ENDPOINTS.APPOINTMENTS}/customer/${customerId}`, data);
    return extractApiResponse(res);
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId, status) {
    const res = await apiClient.put(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/status`, {
      status: status
    });
    return extractApiResponse(res);
  },

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId) {
    const res = await apiClient.get(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`);
    return extractApiResponse(res);
  },

  /**
   * Huỷ lịch hẹn
   */
  async cancel(appointmentId) {
    const res = await apiClient.delete(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`);
    return extractApiResponse(res);
  }
};

export default appointmentsApi;
