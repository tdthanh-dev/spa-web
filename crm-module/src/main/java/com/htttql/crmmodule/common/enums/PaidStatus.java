package com.htttql.crmmodule.common.enums;

/**
 * Payment status for customer cases and invoices
 */
public enum PaidStatus {
    UNPAID("Chưa thanh toán"),
    PARTIALLY_PAID("Thanh toán một phần"),
    FULLY_PAID("Đã thanh toán đầy đủ"),
    OVERPAID("Thanh toán dư");

    private final String description;

    PaidStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}