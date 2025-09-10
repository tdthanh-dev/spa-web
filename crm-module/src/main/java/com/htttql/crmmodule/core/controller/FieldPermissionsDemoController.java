package com.htttql.crmmodule.core.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.core.demo.FieldLevelPermissionsDemo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Demo Controller for Field-Level Permissions
 * WARNING: This is for demonstration purposes only!
 * Remove this controller in production environment.
 */
@RestController
@RequestMapping("/api/demo/field-permissions")
@RequiredArgsConstructor
@Tag(name = "Field Permissions Demo", description = "Demo endpoints for field-level permissions (Development Only)")
@SecurityRequirement(name = "Bearer Authentication")
public class FieldPermissionsDemoController {

    private final FieldLevelPermissionsDemo demo;

    @PostMapping("/run-complete-demo")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Run complete field-level permissions demo", description = "⚠️ DEVELOPMENT ONLY: Run complete demo scenario")
    public ResponseEntity<ApiResponse<String>> runCompleteDemo() {
        try {
            demo.runCompleteDemo();
            return ResponseEntity.ok(ApiResponse.success("✅ Field-Level Permissions Demo completed successfully!",
                    "Demo executed successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<String>error("❌ Demo failed: " + e.getMessage()));
        }
    }

    @PostMapping("/setup-basic-receptionist")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Setup basic receptionist permissions", description = "Setup permissions for basic receptionist (view only)")
    public ResponseEntity<ApiResponse<String>> setupBasicReceptionist() {
        try {
            demo.setupBasicReceptionistPermissions(2L); // Staff ID 2
            return ResponseEntity
                    .ok(ApiResponse.success("✅ Basic receptionist permissions configured!", "Permissions configured"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<String>error("❌ Setup failed: " + e.getMessage()));
        }
    }

    @PostMapping("/setup-senior-receptionist")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Setup senior receptionist permissions", description = "Setup permissions for senior receptionist (view + edit)")
    public ResponseEntity<ApiResponse<String>> setupSeniorReceptionist() {
        try {
            demo.setupSeniorReceptionistPermissions(3L); // Staff ID 3
            return ResponseEntity
                    .ok(ApiResponse.success("✅ Senior receptionist permissions configured!", "Permissions configured"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<String>error("❌ Setup failed: " + e.getMessage()));
        }
    }

    @PostMapping("/setup-customer-specific")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Setup customer-specific permissions", description = "Setup permissions for specific customer access only")
    public ResponseEntity<ApiResponse<String>> setupCustomerSpecific() {
        try {
            demo.setupCustomerSpecificPermissions(4L, 10L); // Staff ID 4, Customer ID 10
            return ResponseEntity
                    .ok(ApiResponse.success("✅ Customer-specific permissions configured!", "Permissions configured"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<String>error("❌ Setup failed: " + e.getMessage()));
        }
    }

    @PostMapping("/setup-temporary-permissions")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Setup temporary permissions", description = "Setup permissions that expire after 8 hours")
    public ResponseEntity<ApiResponse<String>> setupTemporaryPermissions() {
        try {
            demo.setupTemporaryPermissions(5L, 8); // Staff ID 5, 8 hours
            return ResponseEntity
                    .ok(ApiResponse.success("✅ Temporary permissions configured (8 hours)!", "Permissions configured"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<String>error("❌ Setup failed: " + e.getMessage()));
        }
    }

    @PostMapping("/display-permission-summary")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Display permission summary", description = "Display current permission summary for staff member")
    public ResponseEntity<ApiResponse<String>> displayPermissionSummary() {
        try {
            demo.displayPermissionSummary(2L, 10L); // Staff ID 2, Customer ID 10
            return ResponseEntity
                    .ok(ApiResponse.success("✅ Permission summary displayed in logs!", "Summary displayed"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<String>error("❌ Display failed: " + e.getMessage()));
        }
    }

    @PostMapping("/revoke-permissions")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Revoke specific permissions", description = "Revoke specific permissions as demo")
    public ResponseEntity<ApiResponse<String>> revokePermissions() {
        try {
            demo.revokeSpecificPermissions(3L, 10L); // Staff ID 3, Customer ID 10
            return ResponseEntity.ok(ApiResponse.success("✅ Specific permissions revoked!", "Permissions revoked"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<String>error("❌ Revoke failed: " + e.getMessage()));
        }
    }
}
