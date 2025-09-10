package com.htttql.crmmodule.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Role Response DTO - Clean role information for business logic
 * Excludes system metadata, focuses on role definition
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoleResponse {

    private Long roleId;
    private String code;
    private String name;
    private String description;

    // Business metadata (optional for admin views)
    private Integer staffCount; // How many staff members have this role
    private LocalDateTime createdAt; // For admin tracking

    // Display helpers
    public String getDisplayName() {
        return name != null ? name : code;
    }

    public boolean isSystemRole() {
        // Common system roles
        return "ADMIN".equalsIgnoreCase(code) ||
                "MANAGER".equalsIgnoreCase(code) ||
                "RECEPTIONIST".equalsIgnoreCase(code) ||
                "TECHNICIAN".equalsIgnoreCase(code);
    }
}