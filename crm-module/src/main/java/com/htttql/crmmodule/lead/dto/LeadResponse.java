package com.htttql.crmmodule.lead.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.LeadStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Lead Response DTO - Potential customer information
 * Minimal, anti-spam focused data structure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LeadResponse {

    private Long leadId;
    private String fullName;
    private String phone;
    private String note;
    private LeadStatus status;

    // Customer conversion info
    private Long customerId; // If converted to customer
    private Boolean isExistingCustomer;

    // Metadata (safe)
    private java.time.LocalDateTime createdAt;

    // Note: Business logic methods moved to LeadDisplayService
    // to keep DTOs clean and focused on data transfer only
}