package com.htttql.crmmodule.billing.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment Response DTO - Payment transaction information
 * Excludes sensitive payment data like card numbers
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {

    private Long paymentId;

    // Invoice info (shallow)
    private Long invoiceId;
    private String invoiceNumber;

    // Payment details
    private PaymentMethod method;
    private BigDecimal amount;

    // Transaction info (safe)
    private String txnRef;
    private String receiptNumber;

    // Staff info (shallow)
    private Long paidByStaffId;
    private String paidByStaffName;

    // Timing
    private LocalDateTime paidAt;

    // Notes
    private String note;

    // Refund info (if applicable)
    private Boolean isRefunded;
    private LocalDateTime refundedAt;
    private String refundReason;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Display helpers
    public String getDisplayMethod() {
        if (method == null)
            return "Unknown";
        return switch (method) {
            case CASH -> "Tiền mặt";
            case CARD -> "Thẻ tín dụng";
            case BANK -> "Chuyển khoản ngân hàng";
            case EWALLET -> "Ví điện tử";
        };
    }

    public String getDisplayAmount() {
        return amount != null ? amount.toString() + " VND" : "N/A";
    }

    public boolean isRefundable() {
        return !Boolean.TRUE.equals(isRefunded) &&
                paidAt != null &&
                paidAt.isAfter(LocalDateTime.now().minusDays(30)); // 30-day refund policy
    }
}