package com.htttql.crmmodule.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.CaseServiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * CaseService Response DTO - Service line item information
 * Includes service details without full nested objects
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CaseServiceResponse {

    private Long caseServiceId;

    // Case info (shallow)
    private Long caseId;

    // Service info (shallow)
    private Long serviceId;
    private String serviceName;
    private String serviceCategory;
    private String serviceCode;

    // Pricing info
    private BigDecimal unitPrice;
    private Integer qty;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal lineTotal;

    // Status
    private CaseServiceStatus status;

    // Notes
    private String notes;
    private String discountReason;

    // Metadata
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;

    // Computed fields
    public BigDecimal getSubtotal() {
        return unitPrice != null && qty != null ? unitPrice.multiply(BigDecimal.valueOf(qty)) : BigDecimal.ZERO;
    }

    public BigDecimal getDiscountedAmount() {
        BigDecimal subtotal = getSubtotal();
        return discountAmount != null ? subtotal.subtract(discountAmount) : subtotal;
    }

    public String getDisplayStatus() {
        if (status == null)
            return "Unknown";
        return switch (status) {
            case PLANNED -> "Đã lên kế hoạch";
            case IN_PROGRESS -> "Đang thực hiện";
            case DONE -> "Hoàn thành";
            case CANCELLED -> "Đã hủy";
        };
    }

    public boolean hasDiscount() {
        return discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0;
    }
}
