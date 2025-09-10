import { useState, useEffect } from 'react'
import { isAuthenticated, clearAuthData, getAuthData, getUserData } from '@/utils/auth'
import { authAPI } from '@/services/api'
import { isValidRole } from '@/utils/roleRouting'

/**
 * Simple authentication hook
 */
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = () => {
    console.log('🔄 Initializing auth...');
    
    try {
      if (isAuthenticated()) {
        const userData = getUserData();
        console.log('✅ User is authenticated:', userData);
        
        const role = getUserRole(userData);
        if (role && isValidRole(role)) {
          setIsLoggedIn(true);
          setUser(userData);
          setUserRole(role);
          console.log('✅ Auth initialized successfully, role:', role);
        } else {
          console.log('❌ Invalid user role:', userData?.role);
          clearAuthData();
          setError('Invalid user role. Please contact administrator.');
        }
      } else {
        console.log('❌ User is not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      clearAuthData();
      setError('Authentication failed. Please login again.');
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = (userData) => {
    console.log('🔑 Handling login for user:', userData);
    
    const role = getUserRole(userData);
    if (role && isValidRole(role)) {
      setIsLoggedIn(true);
      setUser(userData);
      setUserRole(role);
      setError(null);
      console.log('✅ Login successful, role:', role);
    } else {
      setError('Invalid user role. Please contact administrator.');
      console.error('❌ Invalid role for user:', userData);
    }
  }

  const handleLogout = () => {
    console.log('👋 Logging out user');
    clearAuthData();
    setIsLoggedIn(false);
    setUser(null);
    setUserRole(null);
    setError(null);
  }

  // Helper function to get role name
  const getUserRole = (user) => {
    if (!user) return null;
    
    // Map role from API response
    if (user.role === 'MANAGER' || user.role === 'ADMIN') {
      return 'ADMIN';
    } else if (user.role === 'TECHNICIAN') {
      return 'TECHNICIAN';
    } else if (user.role === 'RECEPTIONIST') {
      return 'RECEPTIONIST';
    }
    
    // Fallback: try position
    if (user.position === 'Lễ Tân') {
      return 'RECEPTIONIST';
    } else if (user.position === 'Kỹ thuật viên') {
      return 'TECHNICIAN';
    } else if (user.position === 'Quản lý' || user.position === 'Admin') {
      return 'ADMIN';
    }
    
    console.warn('Unknown role:', user.role, 'Position:', user.position);
    return null;
  }

  return {
    isLoggedIn,
    user,
    userRole,
    loading,
    error,
    handleLogin,
    handleLogout
  }
}