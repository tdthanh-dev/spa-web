package com.htttql.crmmodule.core.service;

import com.htttql.crmmodule.core.dto.StaffFieldPermissions;

/**
 * Service interface for managing staff field permissions
 */
public interface IStaffFieldPermissionsService {

    /**
     * Create default permissions for a staff member (all EDIT by default)
     */
    StaffFieldPermissions create(Long staffId);

    /**
     * Get permissions by staff ID
     */
    StaffFieldPermissions getByStaffId(Long staffId);

    /**
     * Update permissions for a staff member
     */
    StaffFieldPermissions update(Long staffId, StaffFieldPermissions permissions);
}