import { appointmentsAPI } from './api'

// Appointment Management API - Wrapper for existing appointmentsAPI
export const appointmentsApi = {
  // Get all appointments with pagination
  async getAppointments(params = {}) {
    const { page = 0, size = 20 } = params
    const response = await appointmentsAPI.getAll(page, size)
    return response.data
  },

  // Get appointment by ID
  async getAppointmentById(id) {
    const response = await appointmentsAPI.getById(id)
    return response.data
  },

  // Create new appointment
  async createAppointment(appointmentData) {
    const response = await appointmentsAPI.create(appointmentData)
    return response.data
  },

  // Update appointment
  async updateAppointment(id, appointmentData) {
    const response = await appointmentsAPI.update(id, appointmentData)
    return response.data
  },

  // Delete appointment
  async deleteAppointment(id) {
    await appointmentsAPI.delete(id)
  },

  // Update appointment status
  async updateAppointmentStatus(id, status) {
    const response = await appointmentsAPI.updateStatus(id, status)
    return response.data
  },

  // Get calendar appointments
  async getCalendarAppointments(startDate, endDate) {
    const response = await appointmentsAPI.getCalendar(startDate, endDate)
    return response.data
  },

  // Get technician appointments
  async getTechnicianAppointments(technicianId, params = {}) {
    const { page = 0, size = 20 } = params
    const response = await appointmentsAPI.getTechnicianAppointments(technicianId, page, size)
    return response.data
  },

  // Get today's appointments
  async getTodayAppointments() {
    const response = await appointmentsAPI.getTodayAppointments()
    return response.data
  }
}

export default appointmentsApi
