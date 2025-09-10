// filepath: admin-spa-management/src/pages/users/UserManagement.jsx

import React, { useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import './UserManagement.css';

/**
 * User Management Component - ADMIN only
 * Manage staff users and roles
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement users API call
      console.log('TODO: Fetch users from /api/users');
      
      // Mock data for now
      const mockUsers = [
        {
          id: 1,
          fullName: 'Admin User',
          email: 'admin@spa.com',
          phone: '0123456789',
          role: { roleName: 'ADMIN', description: 'Quản trị viên' },
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          fullName: 'Kỹ thuật viên A',
          email: 'tech1@spa.com',
          phone: '0987654321',
          role: { roleName: 'TECHNICIAN', description: 'Kỹ thuật viên' },
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        }
      ];

      setUsers(mockUsers);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách users. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // TODO: Implement roles API call
      console.log('TODO: Fetch roles from /api/roles');
      
      // Mock data
      const mockRoles = [
        { id: 1, roleName: 'ADMIN', description: 'Quản trị viên' },
        { id: 2, roleName: 'TECHNICIAN', description: 'Kỹ thuật viên' },
        { id: 3, roleName: 'RECEPTIONIST', description: 'Lễ tân' }
      ];

      setRoles(mockRoles);

    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const getRoleStyle = (roleName) => {
    const styles = {
      ADMIN: { background: '#fee2e2', color: '#dc2626', label: 'Admin' },
      TECHNICIAN: { background: '#dcfce7', color: '#166534', label: 'Kỹ thuật viên' },
      RECEPTIONIST: { background: '#dbeafe', color: '#1e40af', label: 'Lễ tân' }
    };
    return styles[roleName] || styles.ADMIN;
  };

  const getStatusStyle = (status) => {
    const styles = {
      ACTIVE: { background: '#dcfce7', color: '#166534', label: 'Hoạt động' },
      INACTIVE: { background: '#f3f4f6', color: '#6b7280', label: 'Tạm ngưng' },
      LOCKED: { background: '#fee2e2', color: '#dc2626', label: 'Khóa' }
    };
    return styles[status] || styles.ACTIVE;
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách nhân viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h1>👥 Quản lý Nhân viên</h1>
        <button className="btn btn-primary">
          ➕ Thêm nhân viên mới
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={fetchUsers} className="retry-btn">Thử lại</button>
        </div>
      )}

      {/* Role Statistics */}
      <div className="role-stats">
        <h2>📊 Thống kê theo vai trò</h2>
        <div className="role-cards">
          {roles.map(role => {
            const userCount = users.filter(user => user.role?.roleName === role.roleName).length;
            const roleStyle = getRoleStyle(role.roleName);
            
            return (
              <div key={role.id} className="role-card">
                <div className="role-header">
                  <span 
                    className="role-badge"
                    style={{
                      background: roleStyle.background,
                      color: roleStyle.color
                    }}
                  >
                    {roleStyle.label}
                  </span>
                  <span className="user-count">{userCount} người</span>
                </div>
                <div className="role-description">{role.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="users-section">
        <h2>📋 Danh sách nhân viên ({users.length})</h2>
        
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Tên đầy đủ</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const roleStyle = getRoleStyle(user.role?.roleName);
                const statusStyle = getStatusStyle(user.status);
                
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{user.fullName}</div>
                        <div className="user-position">{user.position || 'Chưa có'}</div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span 
                        className="role-badge"
                        style={{
                          background: roleStyle.background,
                          color: roleStyle.color
                        }}
                      >
                        {roleStyle.label}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{
                          background: statusStyle.background,
                          color: statusStyle.color
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td>{formatDateTimeVN(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view">👁️</button>
                        <button className="action-btn edit">✏️</button>
                        <button className="action-btn delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="management-note">
        <p><strong>📝 Ghi chú:</strong> Tính năng này đang trong quá trình phát triển. 
           API endpoints đã sẵn sàng tại <code>/api/users</code> và <code>/api/roles</code>.</p>
        <p>Các chức năng cần hoàn thiện: Create user form, Edit user, Role assignment, Status management.</p>
      </div>
    </div>
  );
};

export default UserManagement;
