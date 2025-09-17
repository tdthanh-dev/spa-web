import apiClient from './apiClient';
import { extractApiResponse } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/config/constants';

/**
 * Staff Field Permissions API - New permission system
 * Handles field-level permissions with PermissionLevel (NO, VIEW, EDIT)
 */
export const staffFieldPermissionsApi = {

  /**
   * Create default permissions for staff
   * @param {number} staffId - Staff ID to create permissions for
   * @returns {Promise<Object>} Created permissions
   */
  async createPermissions(staffId) {
    const response = await apiClient.post(`${API_ENDPOINTS.STAFF_FIELD_PERMISSIONS}`, null, {
      params: { staffId }
    });
    return extractApiResponse(response);
  },

  /**
   * Get permissions by staff ID
   * @param {number} staffId - Staff ID to get permissions for
   * @returns {Promise<Object>} Staff field permissions
   */
  async getPermissions(staffId) {
    const response = await apiClient.get(`${API_ENDPOINTS.STAFF_FIELD_PERMISSIONS}/${staffId}`);
    return extractApiResponse(response);
  },

  /**
   * Get all staff users for permission management using common staffUsersApi
   * Note: This method is now handled by staffUsersApi.getStaffUsers() for consistency
   * @deprecated Use staffUsersApi.getStaffUsers() instead
   */

  /**
   * Update permissions for staff
   * @param {number} staffId - Staff ID to update permissions for
   * @param {Object} permissions - Updated permissions object
   * @returns {Promise<Object>} Updated permissions
   */
  async updatePermissions(staffId, permissions) {
    const response = await apiClient.put(`${API_ENDPOINTS.STAFF_FIELD_PERMISSIONS}/${staffId}`, permissions);
    return extractApiResponse(response);
  },

  /**
   * Check if staff has permission for specific field
   * @param {number} staffId - Staff ID
   * @param {string} fieldName - Field name to check
   * @param {string} requiredLevel - Required permission level (VIEW, EDIT)
   * @returns {Promise<boolean>} True if has permission
   */
  async hasFieldPermission(staffId, fieldName, requiredLevel = 'VIEW') {
    try {
      const permissions = await this.getPermissions(staffId);
      const fieldPermission = permissions[fieldName];
      
      if (!fieldPermission || fieldPermission === 'NO') {
        return false;
      }
      
      if (requiredLevel === 'VIEW') {
        return fieldPermission === 'VIEW' || fieldPermission === 'EDIT';
      }
      
      if (requiredLevel === 'EDIT') {
        return fieldPermission === 'EDIT';
      }
      
      return false;
    } catch (error) {
      console.error('Error checking field permission:', error);
      return false;
    }
  },

  /**
   * Bulk update multiple field permissions
   * @param {number} staffId - Staff ID
   * @param {Object} fieldUpdates - Object with field names and their new permission levels
   * @returns {Promise<Object>} Updated permissions
   */
  async bulkUpdateFieldPermissions(staffId, fieldUpdates) {
    const currentPermissions = await this.getPermissions(staffId);
    const updatedPermissions = {
      ...currentPermissions,
      ...fieldUpdates
    };
    return this.updatePermissions(staffId, updatedPermissions);
  },

  /**
   * Grant permission level to specific field
   * @param {number} staffId - Staff ID
   * @param {string} fieldName - Field name
   * @param {string} permissionLevel - Permission level (NO, VIEW, EDIT)
   * @returns {Promise<Object>} Updated permissions
   */
  async grantFieldPermission(staffId, fieldName, permissionLevel) {
    return this.bulkUpdateFieldPermissions(staffId, {
      [fieldName]: permissionLevel
    });
  },

  /**
   * Revoke permission for specific field (set to NO)
   * @param {number} staffId - Staff ID
   * @param {string} fieldName - Field name
   * @returns {Promise<Object>} Updated permissions
   */
  async revokeFieldPermission(staffId, fieldName) {
    return this.grantFieldPermission(staffId, fieldName, 'NO');
  },

  /**
   * Get permissions grouped by category
   * @param {number} staffId - Staff ID
   * @returns {Promise<Object>} Permissions grouped by category
   */
  async getPermissionsByCategory(staffId) {
    const permissions = await this.getPermissions(staffId);
    const { STAFF_FIELD_PERMISSIONS_MAP } = await import('@/config/constants');
    
    const categorized = {};
    Object.entries(permissions).forEach(([fieldName, permissionLevel]) => {
      if (fieldName === 'staffId') return; // Skip staffId field
      
      const fieldConfig = STAFF_FIELD_PERMISSIONS_MAP[fieldName];
      if (!fieldConfig) return;
      
      const category = fieldConfig.category;
      if (!categorized[category]) {
        categorized[category] = {};
      }
      
      categorized[category][fieldName] = {
        level: permissionLevel,
        label: fieldConfig.label,
        description: fieldConfig.description
      };
    });
    
    return categorized;
  },

  /**
   * Set default permissions for a role
   * @param {number} staffId - Staff ID
   * @param {string} roleName - Role name (ADMIN, TECHNICIAN, RECEPTIONIST)
   * @returns {Promise<Object>} Updated permissions
   */
  async setRoleDefaultPermissions(staffId, roleName) {
    let defaultPermissions = {};
    
    switch (roleName) {
      case 'ADMIN':
        // Admin has full access to everything
        defaultPermissions = {
          // Customer fields
          customerName: 'EDIT',
          customerPhone: 'EDIT',
          customerEmail: 'EDIT',
          customerDob: 'EDIT',
          customerGender: 'EDIT',
          customerAddress: 'EDIT',
          customerNotes: 'EDIT',
          // Financial data
          customerTotalSpent: 'EDIT',
          customerTotalPoints: 'EDIT',
          customerTier: 'EDIT',
          customerVipStatus: 'EDIT',
          // Appointments
          appointmentView: 'EDIT',
          appointmentCreate: 'EDIT',
          appointmentUpdate: 'EDIT',
          appointmentCancel: 'EDIT',
          // Invoices
          invoiceView: 'EDIT',
          invoiceCreate: 'EDIT',
          invoiceUpdate: 'EDIT',
          // History
          historyView: 'EDIT',
          historyExport: 'EDIT'
        };
        break;
        
      case 'TECHNICIAN':
        // Technician has limited access
        defaultPermissions = {
          // Customer fields - view only
          customerName: 'VIEW',
          customerPhone: 'VIEW',
          customerEmail: 'VIEW',
          customerDob: 'VIEW',
          customerGender: 'VIEW',
          customerAddress: 'VIEW',
          customerNotes: 'EDIT', // Can edit notes
          // Financial data - view only
          customerTotalSpent: 'VIEW',
          customerTotalPoints: 'VIEW',
          customerTier: 'VIEW',
          customerVipStatus: 'VIEW',
          // Appointments - limited
          appointmentView: 'VIEW',
          appointmentCreate: 'NO',
          appointmentUpdate: 'VIEW',
          appointmentCancel: 'NO',
          // Invoices - view only
          invoiceView: 'VIEW',
          invoiceCreate: 'NO',
          invoiceUpdate: 'NO',
          // History
          historyView: 'VIEW',
          historyExport: 'NO'
        };
        break;
        
      case 'RECEPTIONIST':
        // Receptionist has customer service focused permissions
        defaultPermissions = {
          // Customer fields - full access
          customerName: 'EDIT',
          customerPhone: 'EDIT',
          customerEmail: 'EDIT',
          customerDob: 'EDIT',
          customerGender: 'EDIT',
          customerAddress: 'EDIT',
          customerNotes: 'EDIT',
          // Financial data - view only
          customerTotalSpent: 'VIEW',
          customerTotalPoints: 'VIEW',
          customerTier: 'VIEW',
          customerVipStatus: 'VIEW',
          // Appointments - full access
          appointmentView: 'EDIT',
          appointmentCreate: 'EDIT',
          appointmentUpdate: 'EDIT',
          appointmentCancel: 'EDIT',
          // Invoices - create and view
          invoiceView: 'EDIT',
          invoiceCreate: 'EDIT',
          invoiceUpdate: 'VIEW',
          // History
          historyView: 'VIEW',
          historyExport: 'VIEW'
        };
        break;
        
      default:
        // Default to no permissions
        defaultPermissions = Object.keys(STAFF_FIELD_PERMISSIONS_MAP).reduce((acc, field) => {
          acc[field] = 'NO';
          return acc;
        }, {});
    }
    
    return this.updatePermissions(staffId, defaultPermissions);
  },

  /**
   * Validate permission data
   * @param {Object} permissions - Permissions object to validate
   * @returns {Object} Validation result with errors if any
   */
  validatePermissions(permissions) {
    const errors = [];
    const validLevels = ['NO', 'VIEW', 'EDIT'];
    const { STAFF_FIELD_PERMISSIONS_MAP } = require('@/config/constants');
    
    Object.entries(permissions).forEach(([fieldName, level]) => {
      if (fieldName === 'staffId') return; // Skip staffId field
      
      if (!STAFF_FIELD_PERMISSIONS_MAP[fieldName]) {
        errors.push(`Unknown field: ${fieldName}`);
      }
      
      if (!validLevels.includes(level)) {
        errors.push(`Invalid permission level "${level}" for field "${fieldName}". Valid levels: ${validLevels.join(', ')}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default staffFieldPermissionsApi;