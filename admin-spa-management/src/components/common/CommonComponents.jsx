import React from 'react'

// Export pagination and sorting components
export { default as Pagination } from './Pagination'
export { SortableHeader, SortControl, useSort } from './SortableHeader'

/**
 * Loading Spinner Component
 * Reusable loading indicator with consistent styling
 */
export const LoadingSpinner = ({ size = 'medium', text = 'Đang tải...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: sizeClasses[size].split(' ')[0].replace('w-', '') + 'px',
        height: sizeClasses[size].split(' ')[1].replace('h-', '') + 'px',
        border: '4px solid rgba(246, 169, 176, 0.2)',
        borderLeft: '4px solid #F6A9B0',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#6b7280', fontSize: '16px' }}>{text}</p>
    </div>
  )
}

/**
 * Error Page Component
 * Displays error messages with logout option
 */
export const ErrorPage = ({ error, onLogout, title = '⚠️ Error' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      backgroundColor: '#fef2f2'
    }}>
      <h1 style={{ 
        color: '#dc2626', 
        marginBottom: '16px',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        {title}
      </h1>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px',
        textAlign: 'center',
        maxWidth: '500px',
        lineHeight: '1.6'
      }}>
        {error || 'An unexpected error occurred. Please try again.'}
      </p>
      
      {onLogout && (
        <button 
          onClick={onLogout}
          style={{
            padding: '12px 24px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
        >
          Logout
        </button>
      )}
    </div>
  )
}

/**
 * Empty State Component
 * Displays when there's no data to show
 */
export const EmptyState = ({ 
  icon = '📝', 
  title = 'No Data', 
  description = 'There is no data to display at the moment.',
  action = null 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px'
      }}>
        {icon}
      </div>
      
      <h3 style={{
        color: '#374151',
        marginBottom: '8px',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      
      <p style={{
        color: '#6b7280',
        marginBottom: '24px',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        {description}
      </p>
      
      {action && action}
    </div>
  )
}

/**
 * Status Badge Component
 * Reusable status indicator with consistent styling
 */
export const StatusBadge = ({ 
  status, 
  variant = 'default',
  size = 'medium' 
}) => {
  const variants = {
    default: { background: '#f3f4f6', color: '#374151' },
    success: { background: '#d1fae5', color: '#065f46' },
    warning: { background: '#fef3c7', color: '#92400e' },
    error: { background: '#fee2e2', color: '#991b1b' },
    info: { background: '#dbeafe', color: '#1e40af' }
  }

  const sizes = {
    small: { padding: '4px 8px', fontSize: '12px' },
    medium: { padding: '6px 12px', fontSize: '14px' },
    large: { padding: '8px 16px', fontSize: '16px' }
  }

  const style = {
    ...variants[variant] || variants.default,
    ...sizes[size] || sizes.medium,
    borderRadius: '6px',
    fontWeight: '500',
    display: 'inline-block',
    textAlign: 'center'
  }

  return (
    <span style={style}>
      {status}
    </span>
  )
}
