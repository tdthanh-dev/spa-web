// src/services/leadsApi.js
import { API_CONFIG } from '@constants/apiConfig'

async function buildErrorFromResponse(response) {
  // Cố gắng đọc body dù là JSON hay text
  let raw = ''
  try {
    raw = await response.text()
  } catch (_) {
    // ignore
  }

  let data
  try {
    data = raw ? JSON.parse(raw) : undefined
  } catch (_) {
    data = undefined
  }

  const msg =
    (data && (data.error || data.message)) ||
    raw || // fallback: nội dung text trả về
    `HTTP error! status: ${response.status}`

  const err = new Error(msg)
  // đính kèm thông tin response để UI có thể truy xuất nếu cần
  err.response = { status: response.status, data }
  return err
}

export const leadsApi = {
  /**
   * Submit a new lead
   * @param {Object} leadData - { fullName, phone, note, ... }
   * @returns {Promise<Object>}
   */
  async submitLead(leadData) {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LEADS}`,
      {
        method: 'POST',
        headers: API_CONFIG.HEADERS.DEFAULT,
        body: JSON.stringify(leadData)
      }
    )

    if (!res.ok) {
      throw await buildErrorFromResponse(res)
    }

    // thành công
    return await res.json()
  },

  /**
   * Get all leads
   * @returns {Promise<Array>}
   */
  async getLeads() {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LEADS}`
    )

    if (!res.ok) {
      throw await buildErrorFromResponse(res)
    }

    return await res.json()
  },

  /**
   * Get lead by ID
   * @param {string|number} leadId
   * @returns {Promise<Object>}
   */
  async getLeadById(leadId) {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LEADS}/${leadId}`
    )

    if (!res.ok) {
      throw await buildErrorFromResponse(res)
    }

    return await res.json()
  }
}

export default leadsApi
