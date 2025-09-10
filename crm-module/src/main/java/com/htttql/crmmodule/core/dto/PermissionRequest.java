package com.htttql.crmmodule.core.dto;

import com.htttql.crmmodule.common.enums.PermissionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating/updating permissions
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionRequest {
    @NotBlank(message = "Permission code is required")
    private String code;

    @NotBlank(message = "Permission name is required")
    private String name;

    @NotNull(message = "Permission type is required")
    private PermissionType permissionType;

    private String description;
    private String resourceType;
    private String action;
}
