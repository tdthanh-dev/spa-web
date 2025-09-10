package com.htttql.crmmodule.core.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.enums.PermissionType;
import com.htttql.crmmodule.core.dto.FieldPermissionDTO;
import com.htttql.crmmodule.core.dto.FieldPermissionSummaryDTO;
import com.htttql.crmmodule.core.dto.GrantFieldPermissionRequest;
import com.htttql.crmmodule.core.dto.GrantPermissionRequest;
import com.htttql.crmmodule.core.dto.PermissionDTO;
import com.htttql.crmmodule.core.dto.PermissionRequest;
import com.htttql.crmmodule.core.dto.StaffPermissionSummaryDTO;
import com.htttql.crmmodule.core.dto.UserPermissionDTO;
import com.htttql.crmmodule.core.entity.FieldPermission;
import com.htttql.crmmodule.core.entity.Permission;
import com.htttql.crmmodule.core.entity.UserPermission;
import com.htttql.crmmodule.core.service.IPermissionService;
import com.htttql.crmmodule.core.service.PermissionMapperService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing permissions and user access control
 */
@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@Tag(name = "Permission Management", description = "APIs for managing user permissions")
@SecurityRequirement(name = "Bearer Authentication")
public class PermissionController {

    private final IPermissionService permissionService;
    private final PermissionMapperService permissionMapperService;

    // ========== PERMISSION MANAGEMENT ==========

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create new permission", description = "Create a new permission (Admin only)")
    public ResponseEntity<ApiResponse<PermissionDTO>> createPermission(@Valid @RequestBody PermissionRequest request) {
        PermissionDTO savedPermission = permissionService.createPermission(request);
        return ResponseEntity
                .ok(ApiResponse.success(savedPermission, "Permission created successfully"));
    }

    @PutMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update permission", description = "Update an existing permission (Admin only)")
    public ResponseEntity<PermissionDTO> updatePermission(
            @Parameter(description = "Permission ID") @PathVariable Long permissionId,
            @Valid @RequestBody PermissionRequest request) {

        PermissionDTO updatedPermission = permissionService.updatePermission(permissionId, request);
        return ResponseEntity.ok(updatedPermission);
    }

    @DeleteMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete permission", description = "Delete a permission (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deletePermission(
            @Parameter(description = "Permission ID") @PathVariable Long permissionId) {
        permissionService.deletePermission(permissionId);
        return ResponseEntity.ok(ApiResponse.success("Permission deleted successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get all permissions", description = "Retrieve all permissions (Admin only)")
    public ResponseEntity<ApiResponse<List<PermissionDTO>>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        List<PermissionDTO> dtos = permissionMapperService.mapToPermissionDTOs(permissions);
        return ResponseEntity.ok(ApiResponse.success(dtos, "Permissions retrieved successfully"));
    }

    @GetMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get permission by ID", description = "Retrieve a specific permission (Admin only)")
    public ResponseEntity<PermissionDTO> getPermissionById(
            @Parameter(description = "Permission ID") @PathVariable Long permissionId) {
        Permission permission = permissionService.getPermissionById(permissionId);
        return ResponseEntity.ok(permissionMapperService.mapToPermissionDTO(permission));
    }

    @GetMapping("/type/{permissionType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get permissions by type", description = "Retrieve permissions by type (Admin only)")
    public ResponseEntity<List<PermissionDTO>> getPermissionsByType(
            @Parameter(description = "Permission Type") @PathVariable PermissionType permissionType) {
        List<Permission> permissions = permissionService.getPermissionsByType(permissionType);
        List<PermissionDTO> dtos = permissionMapperService.mapToPermissionDTOs(permissions);
        return ResponseEntity.ok(dtos);
    }

    // ========== USER PERMISSION MANAGEMENT ==========

    @PostMapping("/grant")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Grant permissions to staff", description = "Grant permissions to a staff member (Admin only)")
    public ResponseEntity<List<UserPermissionDTO>> grantPermissions(
            @Valid @RequestBody GrantPermissionRequest request) {

        List<UserPermissionDTO> userPermissionDTOs = permissionService.grantPermissionsWithLogic(request);
        return ResponseEntity.ok(userPermissionDTOs);
    }

    @DeleteMapping("/revoke/{userPermissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Revoke permission", description = "Revoke a specific permission from a staff member (Admin only)")
    public ResponseEntity<Void> revokePermission(
            @Parameter(description = "User Permission ID") @PathVariable Long userPermissionId) {
        permissionService.revokePermission(userPermissionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/revoke/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Revoke all permissions for staff", description = "Revoke all permissions for a staff member (Admin only)")
    public ResponseEntity<Void> revokeAllPermissionsForStaff(
            @Parameter(description = "Staff ID") @PathVariable Long staffId) {
        permissionService.revokeAllPermissionsForStaff(staffId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get permissions for staff", description = "Get all permissions for a specific staff member (Admin only)")
    public ResponseEntity<List<UserPermissionDTO>> getPermissionsForStaff(
            @Parameter(description = "Staff ID") @PathVariable Long staffId) {
        List<UserPermission> userPermissions = permissionService.getPermissionsForStaff(staffId);
        List<UserPermissionDTO> dtos = permissionMapperService.mapToUserPermissionDTOs(userPermissions);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/staff/{staffId}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get active permissions for staff", description = "Get active permissions for a specific staff member (Admin only)")
    public ResponseEntity<List<UserPermissionDTO>> getActivePermissionsForStaff(
            @Parameter(description = "Staff ID") @PathVariable Long staffId) {
        List<UserPermission> userPermissions = permissionService.getActivePermissionsForStaff(staffId);
        List<UserPermissionDTO> dtos = permissionMapperService.mapToUserPermissionDTOs(userPermissions);
        return ResponseEntity.ok(dtos);
    }

    // ========== PERMISSION CHECKING ==========

    @GetMapping("/check/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #staffId == authentication.principal.staffId")
    @Operation(summary = "Check staff permissions", description = "Check what permissions a staff member has")
    public ResponseEntity<StaffPermissionSummaryDTO> checkStaffPermissions(
            @Parameter(description = "Staff ID") @PathVariable Long staffId,
            @Parameter(description = "Customer ID (optional)") @RequestParam(required = false) Long customerId) {

        StaffPermissionSummaryDTO summary = permissionService.createStaffPermissionSummary(staffId, customerId);
        return ResponseEntity.ok(summary);
    }

    // ========== UTILITY ENDPOINTS ==========

    @PostMapping("/initialize")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Initialize system permissions", description = "Initialize default system permissions (Admin only)")
    public ResponseEntity<ApiResponse<Void>> initializeSystemPermissions() {
        permissionService.initializeSystemPermissions();
        return ResponseEntity.ok(ApiResponse.success("System permissions initialized successfully"));
    }

    // ========== MAPPING METHODS ==========

    // ========== FIELD-LEVEL PERMISSION ENDPOINTS ==========

    @PostMapping("/field/grant")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Grant field permissions to staff", description = "Grant field-level permissions to a staff member (Admin only)")
    public ResponseEntity<List<FieldPermissionDTO>> grantFieldPermissions(
            @Valid @RequestBody GrantFieldPermissionRequest request) {

        List<FieldPermissionDTO> fieldPermissionDTOs = permissionService.grantFieldPermissionsWithLogic(request);
        return ResponseEntity.ok(fieldPermissionDTOs);
    }

    @DeleteMapping("/field/revoke/{fieldPermissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Revoke field permission", description = "Revoke a specific field permission from a staff member (Admin only)")
    public ResponseEntity<Void> revokeFieldPermission(
            @Parameter(description = "Field Permission ID") @PathVariable Long fieldPermissionId) {
        permissionService.revokeFieldPermission(fieldPermissionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/field/revoke/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Revoke all field permissions for staff", description = "Revoke all field permissions for a staff member (Admin only)")
    public ResponseEntity<Void> revokeAllFieldPermissionsForStaff(
            @Parameter(description = "Staff ID") @PathVariable Long staffId) {
        permissionService.revokeAllFieldPermissionsForStaff(staffId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/field/revoke/staff/{staffId}/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Revoke field permissions for specific customer", description = "Revoke all field permissions for a staff member on a specific customer (Admin only)")
    public ResponseEntity<Void> revokeFieldPermissionsForCustomer(
            @Parameter(description = "Staff ID") @PathVariable Long staffId,
            @Parameter(description = "Customer ID") @PathVariable Long customerId) {
        permissionService.revokeFieldPermissionsForCustomer(staffId, customerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/field/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get field permissions for staff", description = "Get all field permissions for a specific staff member (Admin only)")
    public ResponseEntity<List<FieldPermissionDTO>> getFieldPermissionsForStaff(
            @Parameter(description = "Staff ID") @PathVariable Long staffId) {
        List<FieldPermission> fieldPermissions = permissionService.getFieldPermissionsForStaff(staffId);
        List<FieldPermissionDTO> dtos = permissionMapperService.mapToFieldPermissionDTOs(fieldPermissions);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/field/staff/{staffId}/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get active field permissions for staff", description = "Get active field permissions for a specific staff member (Admin only)")
    public ResponseEntity<List<FieldPermissionDTO>> getActiveFieldPermissionsForStaff(
            @Parameter(description = "Staff ID") @PathVariable Long staffId) {
        List<FieldPermission> fieldPermissions = permissionService.getActiveFieldPermissionsForStaff(staffId);
        List<FieldPermissionDTO> dtos = permissionMapperService.mapToFieldPermissionDTOs(fieldPermissions);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/field/staff/{staffId}/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get field permissions for staff and customer", description = "Get field permissions for a staff member on a specific customer (Admin only)")
    public ResponseEntity<List<FieldPermissionDTO>> getFieldPermissionsForStaffAndCustomer(
            @Parameter(description = "Staff ID") @PathVariable Long staffId,
            @Parameter(description = "Customer ID") @PathVariable Long customerId) {
        List<FieldPermission> fieldPermissions = permissionService.getFieldPermissionsForStaffAndCustomer(staffId,
                customerId);
        List<FieldPermissionDTO> dtos = permissionMapperService.mapToFieldPermissionDTOs(fieldPermissions);
        return ResponseEntity.ok(dtos);
    }

    // ========== FIELD-LEVEL PERMISSION CHECKING ==========

    @GetMapping("/field/check/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #staffId == authentication.principal.staffId")
    @Operation(summary = "Check field permissions for staff", description = "Check detailed field-level permissions for a staff member")
    public ResponseEntity<FieldPermissionSummaryDTO> checkFieldPermissions(
            @Parameter(description = "Staff ID") @PathVariable Long staffId,
            @Parameter(description = "Customer ID (optional)") @RequestParam(required = false) Long customerId) {

        FieldPermissionSummaryDTO summary = permissionService.createFieldPermissionSummary(staffId, customerId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/field/check/{staffId}/field/{fieldName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or #staffId == authentication.principal.staffId")
    @Operation(summary = "Check field permission", description = "Check if staff has permission for a specific field")
    public ResponseEntity<java.util.Map<String, Boolean>> checkFieldPermission(
            @Parameter(description = "Staff ID") @PathVariable Long staffId,
            @Parameter(description = "Field Name") @PathVariable String fieldName,
            @Parameter(description = "Customer ID (optional)") @RequestParam(required = false) Long customerId) {

        java.util.Map<String, Boolean> result = permissionService.createFieldPermissionMap(staffId, fieldName,
                customerId);
        return ResponseEntity.ok(result);
    }

    // ========== FIELD PERMISSION UTILITIES ==========

    @PostMapping("/field/initialize")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Initialize default field permissions", description = "Initialize default field permissions for roles (Admin only)")
    public ResponseEntity<ApiResponse<Void>> initializeDefaultFieldPermissions() {
        permissionService.initializeDefaultFieldPermissions();
        return ResponseEntity.ok(ApiResponse.success("Default field permissions initialized successfully"));
    }

    @PostMapping("/field/ensure-admin/{adminStaffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Ensure admin has all field permissions", description = "Grant all field permissions to admin user (Admin only)")
    public ResponseEntity<ApiResponse<Void>> ensureAdminHasAllFieldPermissions(
            @Parameter(description = "Admin Staff ID") @PathVariable Long adminStaffId) {
        permissionService.ensureAdminHasAllFieldPermissions(adminStaffId);
        return ResponseEntity.ok(ApiResponse.success("Admin field permissions granted successfully"));
    }

    // ========== MAPPING METHODS FOR FIELD PERMISSIONS ==========

}
