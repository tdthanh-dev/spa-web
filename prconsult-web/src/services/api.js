import axios from 'axios'

// Base API configuration
const API_BASE_URL = 'http://localhost:8081/api'
const IP_SERVICE_URL = 'https://api.ipify.org?format=json'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Get user's IP address
export const getUserIP = async () => {
  try {
    const response = await axios.get(IP_SERVICE_URL, { timeout: 5000 })
    return response.data.ip
  } catch (error) {
    console.error('Error getting IP address:', error)
    return 'unknown'
  }
}

// Submit customer request
export const submitCustomerRequest = async (formData) => {
  try {
    // Get user's IP address
    const ipAddress = await getUserIP()
    
    // Prepare request body
    const requestBody = {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      customerNote: formData.customerNote || '',
      source: 'Web',
      ipAddress: ipAddress
    }
    
    // Send POST request
    const response = await apiClient.post('/customer-requests', requestBody)
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Error submitting customer request:', error)
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Timeout: Vui lòng thử lại sau'
      }
    }
    
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || 'Có lỗi xảy ra từ máy chủ'
      }
    }
    
    if (error.request) {
      // Request made but no response received
      return {
        success: false,
        error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.'
      }
    }
    
    // Something else happened
    return {
      success: false,
      error: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    }
  }
}

export default apiClient