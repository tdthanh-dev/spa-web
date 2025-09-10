package com.htttql.crmmodule.billing.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Invoice Response DTO - Invoice information with payment summary
 * Depth = 1: Includes customer and case info, payment summary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InvoiceResponse {

    private Long invoiceId;
    private String invoiceNumber;

    // Customer info (shallow)
    private Long customerId;
    private String customerName;
    private String customerPhone;

    // Case info (shallow)
    private Long caseId;

    // Invoice amounts
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal taxTotal;
    private BigDecimal grandTotal;

    // Status and dates
    private InvoiceStatus status;
    private LocalDateTime paidAt;
    private LocalDateTime dueDate;

    // Notes and promo
    private String notes;
    private String promoCode;
    private BigDecimal promoDiscount;

    // Loyalty points
    private Integer pointsRedeemed;
    private BigDecimal pointsValue;

    // Payment summary
    private BigDecimal totalPaid;
    private BigDecimal balanceDue;
    private Integer paymentsCount;
    private List<Long> paymentIds; // Max 3 for preview

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    public boolean isPaid() {
        return status != null && status.name().equals("PAID");
    }

    public boolean isOverdue() {
        return dueDate != null && LocalDateTime.now().isAfter(dueDate) && !isPaid();
    }

    public String getDisplayStatus() {
        if (status == null)
            return "Unknown";
        return switch (status) {
            case DRAFT -> "Nháp";
            case UNPAID -> "Chưa thanh toán";
            case PAID -> "Đã thanh toán";
            case VOID -> "Đã hủy";
        };
    }

    public String getPaymentStatus() {
        if (isPaid())
            return "Đã thanh toán đầy đủ";
        if (balanceDue != null && balanceDue.compareTo(BigDecimal.ZERO) == 0)
            return "Đã thanh toán đầy đủ";
        if (totalPaid != null && totalPaid.compareTo(BigDecimal.ZERO) > 0)
            return "Thanh toán một phần";
        return "Chưa thanh toán";
    }
}