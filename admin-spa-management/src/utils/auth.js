// Simple and reliable auth utilities
const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

/**
 * Save authentication data to sessionStorage
 * @param {Object} authResponse - Response from login API
 */
export const saveAuthData = (authResponse) => {
  console.log('💾 Saving auth data:', authResponse);
  
  const { accessToken, userInfo } = authResponse;
  
  if (accessToken) {
    sessionStorage.setItem(TOKEN_KEY, accessToken);
    console.log('✅ Access token saved');
  }
  
  if (userInfo) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    console.log('✅ User info saved');
  }
};

/**
 * Get access token from storage
 * @returns {string|null} Access token or null
 */
export const getAccessToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

/**
 * Get user data from storage
 * @returns {Object|null} User object or null
 */
export const getUserData = () => {
  const userData = sessionStorage.getItem(USER_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  const user = getUserData();
  
  console.log('🔍 Checking authentication:', {
    hasToken: !!token,
    hasUser: !!user
  });
  
  return !!(token && user);
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  console.log('🧹 Clearing auth data');
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  
  // Clear legacy keys if any
  sessionStorage.removeItem('_auth_session');
  sessionStorage.removeItem('_refresh_session');
  sessionStorage.removeItem('_user_session');
  sessionStorage.removeItem('_expires_session');
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  console.log('✅ Auth data cleared');
};

/**
 * Get complete auth data
 * @returns {Object|null} Auth data object or null
 */
export const getAuthData = () => {
  const token = getAccessToken();
  const user = getUserData();
  
  if (token && user) {
    return {
      accessToken: token,
      user: user
    };
  }
  
  return null;
};