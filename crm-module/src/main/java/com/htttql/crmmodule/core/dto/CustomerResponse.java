package com.htttql.crmmodule.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal Customer Response - Only essential info
 * For detailed info, use specific endpoints with proper authorization
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerResponse {

    private Long customerId;
    private String fullName;
    private String phone;

    // Tier info - useful for business logic
    private String tierCode;
    private String tierName;
    private Boolean isVip;

    // Optional fields - only included when specifically requested
    private String email;
    private String displayAddress; // Processed address, not full address
    private java.time.LocalDate dob;
    private String notes;

    // Financial info (masked for security)
    private java.math.BigDecimal totalSpent;
    private Integer totalPoints;
}
