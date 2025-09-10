import { servicesAPI } from './api'

// Service Management API - Wrapper for existing servicesAPI
export const servicesApi = {
  // Get all services with pagination
  async getServices(params = {}) {
    const { page = 0, size = 20 } = params
    const response = await servicesAPI.getAll(page, size)
    return response.data
  },

  // Get service by ID
  async getServiceById(id) {
    const response = await servicesAPI.getById(id)
    return response.data
  },

  // Create new service
  async createService(serviceData) {
    const response = await servicesAPI.create(serviceData)
    return response.data
  },

  // Update service
  async updateService(id, serviceData) {
    const response = await servicesAPI.update(id, serviceData)
    return response.data
  },

  // Delete service
  async deleteService(id) {
    await servicesAPI.delete(id)
  },

  // Get active services only
  async getActiveServices() {
    const response = await servicesAPI.getActive()
    return response.data
  },

  // Get service categories
  async getServiceCategories() {
    const response = await servicesAPI.getCategories()
    return response.data
  }
}

export default servicesApi
