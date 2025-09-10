package com.htttql.crmmodule.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.ServiceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * SpaService Response DTO - Service catalog information
 * Business-focused service data without internal metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SpaServiceResponse {

    private Long serviceId;
    private String code;
    private String name;
    private ServiceCategory category;
    private BigDecimal basePrice;
    private Integer durationMin;
    private Boolean isActive;
    private String description;

    // Business features
    private Boolean requiresConsultation;
    private Boolean requiresPatchTest;

    // Warranty info
    private Integer retouchDays;
    private Integer warrantyDays;

    // Display helpers
    public String getDisplayCategory() {
        if (category == null) return "Unknown";
        return switch (category) {
            case LIP -> "Dịch vụ môi";
            case BROW -> "Dịch vụ chân mày";
            case OTHER -> "Dịch vụ khác";
        };
    }

    public String getDurationDisplay() {
        if (durationMin == null) return "N/A";
        if (durationMin < 60) {
            return durationMin + " phút";
        } else {
            int hours = durationMin / 60;
            int minutes = durationMin % 60;
            return hours + "h" + (minutes > 0 ? minutes + "m" : "");
        }
    }

    public String getPriceDisplay() {
        return basePrice != null ? basePrice.toString() + " VND" : "Liên hệ";
    }
}
