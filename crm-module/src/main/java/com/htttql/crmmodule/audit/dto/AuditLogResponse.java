package com.htttql.crmmodule.audit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * AuditLog Response DTO - Audit trail information
 * Depth = 1: Includes actor info without full nested objects
 * Excludes sensitive IP addresses and session details for security
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogResponse {

    private Long auditId;

    // Actor info (shallow)
    private Long actorId;
    private String actorName;
    private String actorRole;

    // Entity info
    private String entityName;
    private Long entityId;

    // Audit details
    private AuditAction action;
    private Map<String, Object> diff;
    private LocalDateTime createdAt;

    // Additional safe metadata
    private String requestId;

    // Change summary (computed)
    private String changeSummary;
    private Integer fieldsChanged;

    // Metadata
    private LocalDateTime timestamp;

    // Display helpers
    public String getDisplayAction() {
        if (action == null)
            return "Unknown";
        return switch (action) {
            case CREATE -> "Tạo mới";
            case UPDATE -> "Cập nhật";
            case DELETE -> "Xóa";
            case STATUS_CHANGE -> "Thay đổi trạng thái";
            case LOGIN -> "Đăng nhập";
        };
    }

    public String getEntityDisplayName() {
        if (entityName == null || entityId == null)
            return "Unknown";
        return entityName.substring(0, 1).toUpperCase() + entityName.substring(1) + " #" + entityId;
    }

    public boolean hasSignificantChanges() {
        return fieldsChanged != null && fieldsChanged > 0;
    }
}