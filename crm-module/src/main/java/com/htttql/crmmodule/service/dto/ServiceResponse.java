package com.htttql.crmmodule.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.ServiceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Service Response - Public service information
 * Safe for customer-facing applications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServiceResponse {

    private Long serviceId;
    private String code;
    private String name;
    private String description;
    private ServiceCategory category;

    // Price info for customers
    private BigDecimal price;
    private String duration; // "60 minutes" instead of integer

    // Availability
    private Boolean isActive;

    // Remove: createdAt, updatedAt (not needed for public)
    // Remove: durationMinutes (use friendly duration instead)
}
