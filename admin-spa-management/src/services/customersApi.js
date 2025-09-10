import { spaCustomersAPI } from './api'

// Customer Management API - Wrapper for existing spaCustomersAPI
export const customersApi = {
  // Get all customers with pagination
  async getCustomers(params = {}) {
    const { page = 0, size = 20 } = params
    const response = await spaCustomersAPI.getAll(page, size)
    return response.data
  },

  // Get customer by ID
  async getCustomerById(id) {
    const response = await spaCustomersAPI.getById(id)
    return response.data
  },

  // Create new customer
  async createCustomer(customerData) {
    const response = await spaCustomersAPI.create(customerData)
    return response.data
  },

  // Update customer
  async updateCustomer(id, customerData) {
    const response = await spaCustomersAPI.update(id, customerData)
    return response.data
  },

  // Delete customer
  async deleteCustomer(id) {
    await spaCustomersAPI.delete(id)
  },

  // Search customers
  async searchCustomers(searchTerm, params = {}) {
    const { page = 0, size = 20 } = params
    const response = await spaCustomersAPI.search(searchTerm, page, size)
    return response.data
  },

  // Search customers by phone (alias for search)
  async searchCustomersByPhone(phone, params = {}) {
    return this.searchCustomers(phone, params)
  }
}

export default customersApi
