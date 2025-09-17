import { useState, useEffect } from 'react';
import { staffUsersApi, rolesApi } from '@/services';

export const useUserManagement = () => {
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

      // Use staffUsersApi to fetch staff users
      const usersResponse = await staffUsersApi.getStaffUsers({
        page: 0,
        size: 50,
        sortBy: 'staffId',
        sortDir: 'desc'
      });

      setUsers(usersResponse.content || []);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
      setUsers([]);
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // Use rolesApi to fetch roles
      const rolesResponse = await rolesApi.getRoles({
        page: 0,
        size: 50,
        sortBy: 'roleId',
        sortDir: 'asc'
      });

      setRoles(rolesResponse.content || []);

    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
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

  return {
    // State
    users,
    roles,
    loading,
    error,

    // Actions
    fetchUsers,
    fetchRoles,

    // Utils
    getRoleStyle,
    getStatusStyle,
  };
};