import apiClient from './apiClient';

/**
 * Base service class for common CRUD operations
 */
export class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.apiClient = apiClient;
  }

  /**
   * Get all items with pagination and optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20)
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortDir - Sort direction (asc/desc)
   * @param {Object} params.filters - Additional filters
   * @returns {Promise} API response
   */
  async getAll(params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy,
      sortDir,
      ...filters
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortDir) queryParams.append('sortDir', sortDir);

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.endpoint}?${queryParams}`);
    return response.data;
  }

  /**
   * Get item by ID
   * @param {string|number} id - Item ID
   * @returns {Promise} API response
   */
  async getById(id) {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Create new item
   * @param {Object} data - Item data
   * @returns {Promise} API response
   */
  async create(data) {
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  /**
   * Update item by ID
   * @param {string|number} id - Item ID
   * @param {Object} data - Updated data
   * @returns {Promise} API response
   */
  async update(id, data) {
    const response = await apiClient.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  /**
   * Delete item by ID
   * @param {string|number} id - Item ID
   * @returns {Promise} API response
   */
  async delete(id) {
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Search items
   * @param {string} searchTerm - Search term
   * @param {Object} params - Additional parameters
   * @returns {Promise} API response
   */
  async search(searchTerm, params = {}) {
    return this.getAll({
      ...params,
      search: searchTerm
    });
  }

  /**
   * Update status of item
   * @param {string|number} id - Item ID
   * @param {string} status - New status
   * @returns {Promise} API response
   */
  async updateStatus(id, status) {
    const response = await apiClient.put(`${this.endpoint}/${id}/status`, { status });
    return response.data;
  }
}

export default BaseService;
