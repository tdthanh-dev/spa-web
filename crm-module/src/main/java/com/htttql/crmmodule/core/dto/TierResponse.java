package com.htttql.crmmodule.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Tier Response DTO - Business-focused tier information
 * Excludes internal metadata, focuses on customer value
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TierResponse {

    private Long tierId;
    private String code;
    private String name; // Derived from code or custom name
    private BigDecimal minSpent;
    private Integer minPoints;

    // Customer benefits - processed for display
    private Map<String, Object> benefits;

    // Business metadata (optional for admin views)
    private Integer customerCount; // How many customers in this tier
    private LocalDateTime createdAt; // For admin tracking

    // Computed fields
    public String getDisplayName() {
        if (name != null) {
            return name;
        }
        // Default display names based on code
        return switch (code != null ? code.toUpperCase() : "") {
            case "REGULAR" -> "Khách hàng thường";
            case "SILVER" -> "Khách hàng bạc";
            case "GOLD" -> "Khách hàng vàng";
            case "VIP" -> "Khách hàng VIP";
            default -> code;
        };
    }
}