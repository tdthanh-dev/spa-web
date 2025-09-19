package com.htttql.crmmodule.core.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.core.dto.StaffFieldPermissions;
import com.htttql.crmmodule.core.service.IStaffFieldPermissionsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for managing staff field permissions
 */
@Tag(name = "Staff Field Permissions", description = "APIs for managing staff field-level permissions")
@RestController
@RequestMapping("/api/staff-field-permissions")
@RequiredArgsConstructor
public class StaffFieldPermissionsController {

    private final IStaffFieldPermissionsService staffFieldPermissionsService;

    @PostMapping
    @Operation(summary = "Create default permissions for staff", description = "Create permissions with all fields set to EDIT by default")
    public ResponseEntity<ApiResponse<StaffFieldPermissions>> createPermissions(
            @Parameter(description = "Staff ID") @RequestParam Long staffId) {

        StaffFieldPermissions permissions = staffFieldPermissionsService.create(staffId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(permissions, "Permissions created successfully"));
    }

    @GetMapping("/{staffId}")
    @Operation(summary = "Get permissions by staff ID", description = "Retrieve field permissions for a specific staff member. Creates default permissions if not found.")
    public ResponseEntity<ApiResponse<StaffFieldPermissions>> getPermissions(
            @Parameter(description = "Staff ID") @PathVariable Long staffId) {

        StaffFieldPermissions permissions = staffFieldPermissionsService.getByStaffId(staffId);
        if (permissions == null) {
            // Tự động tạo permissions mặc định nếu chưa có
            permissions = staffFieldPermissionsService.create(staffId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(permissions, "Permissions created with default values for staff ID: " + staffId));
        }
        return ResponseEntity.ok(ApiResponse.success(permissions, "Permissions retrieved successfully"));
    }

    @PutMapping("/{staffId}")
    @Operation(summary = "Update permissions for staff", description = "Update field permissions for a specific staff member")
    public ResponseEntity<ApiResponse<StaffFieldPermissions>> updatePermissions(
            @Parameter(description = "Staff ID") @PathVariable Long staffId,
            @Parameter(description = "Updated permissions") @Valid @RequestBody StaffFieldPermissions permissions) {

        StaffFieldPermissions updatedPermissions = staffFieldPermissionsService.update(staffId, permissions);
        return ResponseEntity.ok(ApiResponse.success(updatedPermissions, "Permissions updated successfully"));
    }
}