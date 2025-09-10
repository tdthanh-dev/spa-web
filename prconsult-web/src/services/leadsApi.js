// API service for leads management
import { API_CONFIG } from '@constants/apiConfig'

export const leadsApi = {
  /**
   * Submit a new lead
   * @param {Object} leadData - Lead data containing fullName, phone, note
   * @returns {Promise<Object>} Response from API
   */
  async submitLead(leadData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LEADS}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS.DEFAULT,
        body: JSON.stringify(leadData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting lead:', error)
      throw error
    }
  },

  /**
   * Get all leads (for future use)
   * @returns {Promise<Array>} Array of leads
   */
  async getLeads() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LEADS}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching leads:', error)
      throw error
    }
  },

  /**
   * Get lead by ID (for future use)
   * @param {string|number} leadId - Lead ID
   * @returns {Promise<Object>} Lead data
   */
  async getLeadById(leadId) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LEADS}/${leadId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching lead:', error)
      throw error
    }
  }
}

export default leadsApi
