package com.htttql.crmmodule.lead.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lead Public Response - For external lead submission
 * Minimal data exposure for security
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LeadPublicResponse {

    private String referenceNumber; // Generated tracking number
    private String message;
    private String status; // "SUBMITTED" or "RECEIVED"

    // No internal IDs, no tracking data, no business logic exposure
}
