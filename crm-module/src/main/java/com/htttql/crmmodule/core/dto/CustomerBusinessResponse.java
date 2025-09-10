package com.htttql.crmmodule.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Customer Business Response - Manager access only
 * Contains financial and business analytics data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerBusinessResponse {

    private Long customerId;
    private String fullName;

    // Financial data - Manager only
    private Integer totalPoints;
    private BigDecimal totalSpent;
    private BigDecimal averageOrderValue;
    private Integer totalOrders;

    // Business insights
    private String customerSegment; // High-value, Regular, New, etc.
    private String lastVisit; // "2 weeks ago"
    private String riskLevel; // Churn risk assessment

    // System metadata - for business analysis
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;

    // Internal notes - sensitive data
    private String notes;
}
