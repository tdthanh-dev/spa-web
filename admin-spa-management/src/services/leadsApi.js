import { leadsAPI } from './api'

// Lead Management API - Wrapper for existing leadsAPI
export const leadsApi = {
  // Get all leads with pagination
  async getLeads(params = {}) {
    const { page = 0, size = 20, sortBy = 'leadId', sortDir = 'desc' } = params
    const response = await leadsAPI.getAll(page, size, sortBy, sortDir)
    return response.data
  },

  // Get lead by ID
  async getLeadById(id) {
    const response = await leadsAPI.getById(id)
    return response.data
  },

  // Create new lead (public API)
  async createLead(leadData) {
    const response = await leadsAPI.create(leadData)
    return response.data
  },

  // Update lead
  async updateLead(id, leadData) {
    const response = await leadsAPI.update(id, leadData)
    return response.data
  },

  // Delete lead
  async deleteLead(id) {
    await leadsAPI.delete(id)
  },

  // Update lead status
  async updateLeadStatus(id, status) {
    const response = await leadsAPI.updateStatus(id, status)
    return response.data
  },

  // Get leads with search
  async getLeadsWithSearch(params = {}) {
    const { page = 0, size = 20, sortBy = 'leadId', sortDir = 'desc', search = '' } = params
    const response = await leadsAPI.getAllWithSearch(page, size, sortBy, sortDir, search)
    return response.data
  },

  // Get leads by status
  async getLeadsByStatus(status, params = {}) {
    const { page = 0, size = 20, sortBy = 'leadId', sortDir = 'desc' } = params
    const response = await leadsAPI.getByStatus(status, page, size, sortBy, sortDir)
    return response.data
  }
}

export default leadsApi
