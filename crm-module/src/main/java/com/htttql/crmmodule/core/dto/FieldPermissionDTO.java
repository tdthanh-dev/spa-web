package com.htttql.crmmodule.core.dto;

import com.htttql.crmmodule.common.enums.PermissionScope;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for FieldPermission entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldPermissionDTO {
    private Long fieldPermissionId;
    private Long staffId;
    private String staffName;
    private PermissionScope permissionScope;
    private String scopeDescription;
    private Long customerId;
    private String customerName;
    private Boolean isGranted;
    private Long grantedByStaffId;
    private String grantedByStaffName;
    private LocalDateTime grantedAt;
    private LocalDateTime expiresAt;
    private String notes;

    // Additional computed fields
    private String fieldName;
    private String actionType;
    private boolean isExpired;
    private boolean isActive;
}
