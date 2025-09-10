import { BaseService } from './BaseService';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * Leads Service - handles consultation requests
 * Updated to match backend LeadController API structure
 */
class LeadsService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.LEADS);
  }

  /**
   * Get leads by status using dedicated endpoint
   * @param {string} status - Lead status (NEW, IN_PROGRESS, WON, LOST)
   * @param {Object} params - Pagination and sorting parameters
   * @returns {Promise} API response with Page<LeadResponse>
   */
  async getByStatus(status, params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy = 'leadId',
      sortDir = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });

    const response = await this.apiClient.get(`${this.endpoint}/status/${status}?${queryParams}`);
    return response.data;
  }

  /**
   * Get leads with search functionality
   * @param {string} searchTerm - Search term (name, phone, email)
   * @param {Object} params - Additional parameters
   * @returns {Promise} API response
   */
  async searchLeads(searchTerm, params = {}) {
    return this.getAll({
      ...params,
      search: searchTerm
    });
  }

  /**
   * Update lead status using dedicated endpoint
   * @param {string|number} id - Lead ID
   * @param {string} status - New status (LeadStatus enum)
   * @param {string} note - Optional note for status change
   * @returns {Promise} API response with updated LeadResponse
   */
  async updateLeadStatus(id, status, note = '') {
    const requestData = {
      status: status,
      note: note.trim() || null
    };

    const response = await this.apiClient.put(`${this.endpoint}/${id}/status`, requestData);
    return response.data;
  }

  /**
   * Update lead information
   * @param {string|number} id - Lead ID
   * @param {Object} leadData - Lead data to update
   * @returns {Promise} API response with updated LeadResponse
   */
  async updateLead(id, leadData) {
    const response = await this.apiClient.put(`${this.endpoint}/${id}`, leadData);
    return response.data;
  }

  /**
   * Create new lead (public API - no authentication required)
   * @param {Object} leadData - Lead data
   * @returns {Promise} API response with created LeadResponse
   */
  async createLead(leadData) {
    const response = await this.apiClient.post(this.endpoint, leadData);
    return response.data;
  }

  /**
   * Get lead statistics
   * @returns {Promise} API response with LeadStats
   */
  async getStats() {
    const response = await this.apiClient.get(`${this.endpoint}/stats`);
    return response.data;
  }

  /**
   * Convert lead to customer
   * @param {string|number} leadId - Lead ID
   * @param {Object} customerData - Customer data
   * @returns {Promise} API response
   */
  async convertToCustomer(leadId, customerData) {
    const response = await this.apiClient.post(`${this.endpoint}/${leadId}/convert`, customerData);
    return response.data;
  }

  /**
   * Mark lead as won (converted to customer)
   * @param {string|number} id - Lead ID
   * @param {string|number} customerId - Customer ID
   * @returns {Promise} API response
   */
  async markAsWon(id, customerId) {
    return this.updateLeadStatus(id, 'WON', `Converted to customer ID: ${customerId}`);
  }

  /**
   * Mark lead as lost
   * @param {string|number} id - Lead ID
   * @param {string} reason - Reason for losing the lead
   * @returns {Promise} API response
   */
  async markAsLost(id, reason = '') {
    return this.updateLeadStatus(id, 'LOST', reason);
  }

  /**
   * Mark lead as in progress
   * @param {string|number} id - Lead ID
   * @param {string} note - Optional note
   * @returns {Promise} API response
   */
  async markAsInProgress(id, note = '') {
    return this.updateLeadStatus(id, 'IN_PROGRESS', note);
  }
}

export const leadsService = new LeadsService();
export default leadsService;
