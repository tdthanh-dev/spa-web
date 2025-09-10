// filepath: admin-spa-management/src/components/guards/RoleGuard.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasAccess, getRoleDefaultPath } from '@/utils/roleRouting';

/**
 * Role Guard - Checks if user has access to specific routes based on their role
 * Redirects to 403 page or role default path if access denied
 */
const RoleGuard = ({ children, requiredRoles = [], userRole, currentPath }) => {
  // If no specific roles required, allow access
  if (requiredRoles.length === 0) {
    return children;
  }
  
  // Check if user role is in required roles
  const hasRoleAccess = requiredRoles.includes(userRole);
  
  // Check if user has path-based access
  const hasPathAccess = hasAccess(userRole, currentPath);
  
  if (!hasRoleAccess || !hasPathAccess) {
    console.warn(`Access denied for role ${userRole} to path ${currentPath}`);
    
    // Redirect to role default path or 403 page
    const defaultPath = getRoleDefaultPath(userRole);
    return <Navigate to={defaultPath || '/403'} replace />;
  }
  
  return children;
};

/**
 * Simple 403 Forbidden Page
 */
export const ForbiddenPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        fontSize: '72px',
        marginBottom: '20px'
      }}>
        🚫
      </div>
      <h1 style={{
        color: '#dc2626',
        marginBottom: '16px',
        fontSize: '24px'
      }}>
        Truy cập bị từ chối
      </h1>
      <p style={{
        color: '#6b7280',
        marginBottom: '24px',
        fontSize: '16px'
      }}>
        Bạn không có quyền truy cập vào trang này.
      </p>
      <button 
        onClick={() => window.history.back()} 
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        ← Quay lại
      </button>
    </div>
  );
};

export default RoleGuard;
