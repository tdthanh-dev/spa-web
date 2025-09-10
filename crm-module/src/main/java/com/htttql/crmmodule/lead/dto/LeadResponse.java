package com.htttql.crmmodule.lead.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.LeadStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private java.sql.Date createdDate;

    // Display helpers
    public String getDisplayStatus() {
        if (status == null)
            return "Unknown";
        return switch (status) {
            case NEW -> "Mới";
            case IN_PROGRESS -> "Đang xử lý";
            case WON -> "Đã chuyển đổi";
            case LOST -> "Mất khách";
        };
    }

    public boolean isConverted() {
        return customerId != null || Boolean.TRUE.equals(isExistingCustomer);
    }

    public String getLeadSource() {
        // Could be derived from IP patterns or other metadata
        return "Website/Public API";
    }
}