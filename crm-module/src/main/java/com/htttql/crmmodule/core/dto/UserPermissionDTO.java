package com.htttql.crmmodule.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for UserPermission entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPermissionDTO {
    private Long userPermissionId;
    private Long staffId;
    private String staffName;
    private Long permissionId;
    private String permissionName;
    private String permissionCode;
    private Long customerId;
    private String customerName;
    private Boolean isActive;
    private Long grantedByStaffId;
    private String grantedByStaffName;
    private LocalDateTime grantedAt;
    private LocalDateTime expiresAt;
    private String notes;
}
