// API Configuration constants
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8081/api',
  ENDPOINTS: {
    LEADS: '/leads',
    USERS: '/users',
    APPOINTMENTS: '/appointments'
  },
  HEADERS: {
    DEFAULT: {
      'Content-Type': 'application/json',
      'accept': '*/*'
    },
    AUTH: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '
    }
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3
}

// Environment-based configuration
export const getApiConfig = () => {
  const isProduction = import.meta.env.PROD
  
  return {
    ...API_CONFIG,
    BASE_URL: isProduction 
      ? 'https://your-production-api.com/api' 
      : API_CONFIG.BASE_URL
  }
}
