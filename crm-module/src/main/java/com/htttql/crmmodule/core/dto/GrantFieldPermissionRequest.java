package com.htttql.crmmodule.core.dto;

import com.htttql.crmmodule.common.enums.PermissionScope;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Request DTO for granting field permissions to staff
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrantFieldPermissionRequest {
    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @NotNull(message = "Permission scopes are required")
    private List<PermissionScope> permissionScopes;

    // Optional: restrict to specific customers
    private List<Long> customerIds;

    // Optional: permission expiration
    private LocalDateTime expiresAt;

    private String notes;
}
