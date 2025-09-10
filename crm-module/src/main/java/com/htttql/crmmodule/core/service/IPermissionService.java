package com.htttql.crmmodule.core.service;

import com.htttql.crmmodule.core.entity.*;
import com.htttql.crmmodule.core.dto.FieldPermissionDTO;
import com.htttql.crmmodule.core.dto.FieldPermissionSummaryDTO;
import com.htttql.crmmodule.core.dto.GrantFieldPermissionRequest;
import com.htttql.crmmodule.core.dto.GrantPermissionRequest;
import com.htttql.crmmodule.core.dto.PermissionDTO;
import com.htttql.crmmodule.core.dto.PermissionRequest;
import com.htttql.crmmodule.core.dto.UserPermissionDTO;
import com.htttql.crmmodule.core.dto.StaffPermissionSummaryDTO;
import com.htttql.crmmodule.common.enums.PermissionScope;
import com.htttql.crmmodule.common.enums.PermissionType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for managing permissions and user access control
 */
public interface IPermissionService {

    // Permission management
    Permission createPermission(Permission permission);

    Permission updatePermission(Long permissionId, Permission permission);

    void deletePermission(Long permissionId);

    Permission getPermissionById(Long permissionId);

    Permission getPermissionByCode(String code);

    List<Permission> getAllPermissions();

    List<Permission> getPermissionsByType(PermissionType permissionType);

    List<Permission> getPermissionsByResourceType(String resourceType);

    // User permission management
    UserPermission grantPermission(Long staffId, Long permissionId, Long customerId,
            Long grantedByStaffId, LocalDateTime expiresAt, String notes);

    UserPermission grantPermission(Long staffId, Long permissionId, Long grantedByStaffId);

    void revokePermission(Long userPermissionId);

    void revokeAllPermissionsForStaff(Long staffId);

    void revokePermissionForStaffAndCustomer(Long staffId, Long customerId);

    List<UserPermission> getPermissionsForStaff(Long staffId);

    List<UserPermission> getActivePermissionsForStaff(Long staffId);

    List<UserPermission> getPermissionsForStaffAndResource(Long staffId, String resourceType);

    // Permission checking
    boolean hasPermission(Long staffId, String resourceType, String action, Long customerId);

    boolean hasPermission(Long staffId, String resourceType, String action);

    // Legacy methods for backward compatibility
    boolean canViewCustomerBasic(Long staffId, Long customerId);

    boolean canViewCustomerDetails(Long staffId, Long customerId);

    boolean canViewCustomerHistory(Long staffId, Long customerId);

    boolean canViewCustomerFinancial(Long staffId, Long customerId);

    boolean canManageCustomer(Long staffId, Long customerId);

    boolean canManageAppointments(Long staffId, Long customerId);

    boolean canManageInvoices(Long staffId, Long customerId);

    // Bulk operations
    void grantPermissionsToStaff(Long staffId, List<Long> permissionIds, Long grantedByStaffId);

    void grantCustomerSpecificPermissions(Long staffId, List<Long> customerIds,
            List<Long> permissionIds, Long grantedByStaffId);

    // ========== FIELD-LEVEL PERMISSIONS ==========

    // Field permission management
    FieldPermission grantFieldPermission(Long staffId, PermissionScope permissionScope, Long customerId,
            Long grantedByStaffId, LocalDateTime expiresAt, String notes);

    FieldPermission grantFieldPermission(Long staffId, PermissionScope permissionScope, Long grantedByStaffId);

    void revokeFieldPermission(Long fieldPermissionId);

    void revokeFieldPermission(Long staffId, PermissionScope permissionScope, Long customerId);

    void revokeAllFieldPermissionsForStaff(Long staffId);

    void revokeFieldPermissionsForCustomer(Long staffId, Long customerId);

    List<FieldPermission> getFieldPermissionsForStaff(Long staffId);

    List<FieldPermission> getActiveFieldPermissionsForStaff(Long staffId);

    List<FieldPermission> getFieldPermissionsForStaffAndCustomer(Long staffId, Long customerId);

    // Field permission checking - granular access control
    boolean canReadCustomerField(Long staffId, String fieldName, Long customerId);

    boolean canWriteCustomerField(Long staffId, String fieldName, Long customerId);

    boolean canReadCustomerName(Long staffId, Long customerId);

    boolean canWriteCustomerName(Long staffId, Long customerId);

    boolean canReadCustomerPhone(Long staffId, Long customerId);

    boolean canWriteCustomerPhone(Long staffId, Long customerId);

    boolean canReadCustomerEmail(Long staffId, Long customerId);

    boolean canWriteCustomerEmail(Long staffId, Long customerId);

    boolean canReadCustomerAddress(Long staffId, Long customerId);

    boolean canWriteCustomerAddress(Long staffId, Long customerId);

    boolean canReadCustomerDOB(Long staffId, Long customerId);

    boolean canWriteCustomerDOB(Long staffId, Long customerId);

    boolean canReadCustomerNotes(Long staffId, Long customerId);

    boolean canWriteCustomerNotes(Long staffId, Long customerId);

    boolean canManageCustomerAppointments(Long staffId, Long customerId);

    boolean canManageCustomerInvoices(Long staffId, Long customerId);

    boolean canExportCustomerData(Long staffId, Long customerId);

    boolean canDeleteCustomer(Long staffId, Long customerId);

    // Bulk field permission operations
    void grantFieldPermissionsToStaff(Long staffId, List<PermissionScope> permissionScopes, Long grantedByStaffId);

    void grantCustomerFieldPermissions(Long staffId, Long customerId, List<PermissionScope> permissionScopes,
            Long grantedByStaffId);

    void grantFieldPermissionsToMultipleCustomers(Long staffId, List<Long> customerIds,
            List<PermissionScope> permissionScopes, Long grantedByStaffId);

    // Field permission utilities
    List<PermissionScope> getAllGrantedScopesForStaff(Long staffId);

    List<String> getReadableFieldsForCustomer(Long staffId, Long customerId);

    List<String> getWritableFieldsForCustomer(Long staffId, Long customerId);

    boolean hasAnyFieldPermissionForCustomer(Long staffId, Long customerId);

    // ========== BACKWARD COMPATIBILITY ==========

    // Utility methods
    void initializeSystemPermissions();

    List<Permission> getDefaultPermissionsForRole(String roleCode);

    void ensureAdminHasAllPermissions(Long adminStaffId);

    // Field permission initialization
    void initializeDefaultFieldPermissions();

    void ensureAdminHasAllFieldPermissions(Long adminStaffId);

    // Permission summary methods
    StaffPermissionSummaryDTO createStaffPermissionSummary(Long staffId, Long customerId);

    FieldPermissionSummaryDTO createFieldPermissionSummary(Long staffId, Long customerId);

    // Field permission checking methods
    java.util.Map<String, Boolean> createFieldPermissionMap(Long staffId, String fieldName, Long customerId);

    // Permission CRUD with request mapping
    PermissionDTO createPermission(PermissionRequest request);

    PermissionDTO updatePermission(Long permissionId, PermissionRequest request);

    // Permission granting with business logic
    List<UserPermissionDTO> grantPermissionsWithLogic(GrantPermissionRequest request);

    List<FieldPermissionDTO> grantFieldPermissionsWithLogic(GrantFieldPermissionRequest request);
}
