import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { getAccessToken, getRefreshToken, clearAuthData, saveAuthData } from '@/utils/auth';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Track refresh token requests to prevent multiple concurrent requests
let isRefreshing = false;
let failedQueue = [];

// Process failed requests queue
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Show user-friendly error messages
const showErrorToast = (message, type = 'error') => {
  // Simple browser alert for now - can be replaced with toast library
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.error(`${prefix} ${message}`);
  // In a real app, you'd use a toast library like react-toastify
  // toast.error(message);
};

// Check if error is network related
const isNetworkError = (error) => {
  return !error.response && error.code === 'NETWORK_ERROR';
};

// Check if error is timeout
const isTimeoutError = (error) => {
  return error.code === 'ECONNABORTED';
};

// Request interceptor with retry logic
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 Making ${config.method?.toUpperCase()} request to: ${config.url}`);

    // Add auth token for protected endpoints
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 With auth token for endpoint:', config.url);
    } else {
      console.log('🚫 No auth token available for:', config.url);
    }

    // Add retry configuration
    if (!config._retry) {
      config._retry = 0;
    }

    return config;
  },
  (error) => {
    console.error('📤 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with advanced error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.error('🚨 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle network errors with retry
    if (isNetworkError(error) || isTimeoutError(error)) {
      const maxRetries = 3;
      const currentRetry = originalRequest._retry || 0;

      if (currentRetry < maxRetries) {
        console.log(`🔄 Retrying request (${currentRetry + 1}/${maxRetries}) for: ${originalRequest.url}`);

        // Exponential backoff delay
        const delay = Math.pow(2, currentRetry) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Increment retry count
        originalRequest._retry = currentRetry + 1;

        // Retry the request
        return apiClient(originalRequest);
      } else {
        const errorType = isNetworkError(error) ? 'mạng' : 'timeout';
        showErrorToast(`Không thể kết nối sau ${maxRetries} lần thử. Vui lòng kiểm tra kết nối ${errorType}.`, 'error');
        return Promise.reject(error);
      }
    }

    // Handle HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400: {
          // Bad Request - Validation error
          const errorMessage = data?.message || data?.error || 'Dữ liệu không hợp lệ';
          showErrorToast(`Lỗi dữ liệu: ${errorMessage}`);
          break;
        }

        case 401:
          // Unauthorized - Token expired or invalid
          console.warn('🔴 401 Unauthorized - Token expired or invalid');

          // If this is a retry request, don't try to refresh again
          if (originalRequest._retry) {
            clearAuthData();
            showErrorToast('Phiên đăng nhập đã hết hạn. Đang chuyển hướng...', 'warning');
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
            return Promise.reject(error);
          }

          // Try to refresh token
          if (!isRefreshing) {
            console.log('🔄 Attempting to refresh token...');
            isRefreshing = true;

            try {
              const refreshToken = getRefreshToken();

              if (!refreshToken) {
                console.error('❌ No refresh token available');
                clearAuthData();
                showErrorToast('Phiên đăng nhập đã hết hạn. Đang chuyển hướng...', 'warning');
                setTimeout(() => {
                  window.location.href = '/';
                }, 1500);
                return Promise.reject(error);
              }

              // Call refresh token endpoint
              const refreshResponse = await apiClient.post('/auth/refresh', {
                refreshToken: refreshToken
              });

              if (refreshResponse.data && refreshResponse.data.success) {
                const newAuthData = refreshResponse.data.data;
                saveAuthData(newAuthData);

                console.log('✅ Token refreshed successfully');
                const newToken = newAuthData.accessToken;

                // Process queued requests with new token
                processQueue(null, newToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
              } else {
                throw new Error('Invalid refresh response');
              }

            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
              clearAuthData();
              showErrorToast('Phiên đăng nhập đã hết hạn. Đang chuyển hướng...', 'warning');
              setTimeout(() => {
                window.location.href = '/';
              }, 1500);
              processQueue(refreshError, null);
              return Promise.reject(error);
            } finally {
              isRefreshing = false;
            }
          }

          // Add request to queue
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                if (token) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(apiClient(originalRequest));
              },
              reject: (err) => {
                reject(err);
              }
            });
          });

        case 403: {
          // Forbidden - Insufficient permissions
          const permissionError = data?.message || data?.error || 'Bạn không có quyền truy cập chức năng này';
          showErrorToast(`🚫 ${permissionError}`, 'error');
          break;
        }

        case 404:
          // Not Found
          showErrorToast('Không tìm thấy tài nguyên yêu cầu', 'warning');
          break;

        case 422: {
          // Unprocessable Entity - Validation errors
          const validationErrors = data?.errors || data?.message || 'Dữ liệu không hợp lệ';
          showErrorToast(`Lỗi xác thực: ${validationErrors}`);
          break;
        }

        case 429:
          // Too Many Requests - Rate limiting
          showErrorToast('Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.', 'warning');
          break;

        case 500:
          // Internal Server Error
          showErrorToast('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.', 'error');
          break;

        case 502:
        case 503:
        case 504:
          // Server unavailable
          showErrorToast('Máy chủ đang bận. Vui lòng thử lại sau.', 'warning');
          break;

        default: {
          // Other errors
          const defaultMessage = data?.message || data?.error || `Lỗi không xác định (${status})`;
          showErrorToast(defaultMessage);
          break;
        }
      }
    } else {
      // Network or other errors
      showErrorToast('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.', 'error');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
