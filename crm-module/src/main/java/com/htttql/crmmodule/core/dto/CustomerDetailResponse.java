package com.htttql.crmmodule.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Customer Detail Response - For authorized staff only
 * Contains personal information needed for service delivery
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerDetailResponse {

    private Long customerId;
    private String fullName;
    private String phone;
    private String email;

    // Personal info for service delivery
    private LocalDate dob;
    private Gender gender;
    private String displayAddress; // Processed for display only

    // Business info
    private String tierCode;
    private String tierName;
    private Boolean isVip;

    // Summary stats (not detailed financial data)
    private String memberSince; // e.g., "6 months ago"
    private Integer visitCount; // Total visits, not financial details
}
