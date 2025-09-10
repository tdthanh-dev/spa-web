package com.htttql.crmmodule.core.dto;

import com.htttql.crmmodule.common.enums.PermissionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Permission entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDTO {
    private Long permissionId;
    private String code;
    private String name;
    private PermissionType permissionType;
    private String description;
    private Boolean isSystemPermission;
    private String resourceType;
    private String action;
}
