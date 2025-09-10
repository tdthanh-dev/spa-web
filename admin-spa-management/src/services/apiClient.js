import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { getAccessToken, clearAuthData } from '@/utils/auth';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    // Add auth token for protected endpoints
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('With auth token for endpoint:', config.url);
    } else {
      console.log('No auth token available for:', config.url);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.warn('🔴 401 Unauthorized - Redirecting to login');
      
      // Clear auth data and redirect
      clearAuthData();
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
