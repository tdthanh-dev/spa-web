package com.htttql.crmmodule.common.factory;

import com.htttql.crmmodule.core.dto.CustomerResponse;
import com.htttql.crmmodule.core.dto.CustomerDetailResponse;
import com.htttql.crmmodule.core.dto.CustomerBusinessResponse;
import com.htttql.crmmodule.core.entity.Customer;
import com.htttql.crmmodule.common.enums.TierCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Response Factory - Smart mapping with data processing
 * Handles data transformation and security filtering
 */
@Component
@RequiredArgsConstructor
public class CustomerResponseFactory {

    /**
     * Create minimal customer response for lists and public APIs
     */
    public CustomerResponse createBasicResponse(Customer customer) {
        return CustomerResponse.builder()
                .customerId(customer.getCustomerId())
                .fullName(customer.getFullName())
                .phone(maskPhone(customer.getPhone()))
                .tierCode(customer.getTier().getCode().name())
                .tierName(customer.getTier().getCode().getDescription())
                .isVip(customer.getIsVip())
                .email(customer.getEmail() != null ? maskEmail(customer.getEmail()) : null)
                .displayAddress(processAddress(customer.getAddress()))
                .build();
    }

    /**
     * Create full customer response with all data (for permission-based masking)
     */
    public CustomerResponse createFullResponse(Customer customer) {
        return CustomerResponse.builder()
                .customerId(customer.getCustomerId())
                .fullName(customer.getFullName())
                .phone(customer.getPhone()) // Full phone, no masking
                .email(customer.getEmail()) // Full email, no masking
                .displayAddress(customer.getAddress()) // Full address
                .dob(customer.getDob())
                .notes(customer.getNotes())
                .tierCode(customer.getTier().getCode().name())
                .tierName(customer.getTier().getCode().getDescription())
                .isVip(customer.getIsVip())
                .totalSpent(customer.getTotalSpent())
                .totalPoints(customer.getTotalPoints())
                .build();
    }

    /**
     * Create detailed response for authorized staff
     */
    public CustomerDetailResponse createDetailResponse(Customer customer) {
        return CustomerDetailResponse.builder()
                .customerId(customer.getCustomerId())
                .fullName(customer.getFullName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .dob(customer.getDob())
                .gender(customer.getGender())
                .displayAddress(processAddress(customer.getAddress()))
                .tierCode(customer.getTier().getCode().name())
                .tierName(customer.getTier().getCode().getDescription())
                .isVip(customer.getIsVip())
                .memberSince(calculateMembershipDuration(customer.getCreatedAt()))
                .visitCount(calculateVisitCount(customer))
                .build();
    }

    /**
     * Create business response for managers only
     */
    public CustomerBusinessResponse createBusinessResponse(Customer customer) {
        return CustomerBusinessResponse.builder()
                .customerId(customer.getCustomerId())
                .fullName(customer.getFullName())
                .totalPoints(customer.getTotalPoints())
                .totalSpent(customer.getTotalSpent())
                .averageOrderValue(calculateAverageOrderValue(customer))
                .totalOrders(calculateTotalOrders(customer))
                .customerSegment(determineCustomerSegment(customer))
                .lastVisit(calculateLastVisit(customer))
                .riskLevel(assessChurnRisk(customer))
                .createdAt(customer.getCreatedAt())
                .lastUpdated(customer.getUpdatedAt())
                .notes(customer.getNotes())
                .build();
    }

    // Helper methods for data processing

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4)
            return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@"))
            return email;
        String[] parts = email.split("@");
        String local = parts[0];
        if (local.length() <= 2)
            return email;
        return local.substring(0, 2) + "****@" + parts[1];
    }

    private String processAddress(String address) {
        if (address == null)
            return null;
        // Return only district/city, remove detailed address
        String[] parts = address.split(",");
        if (parts.length >= 2) {
            return parts[parts.length - 2].trim() + ", " + parts[parts.length - 1].trim();
        }
        return address;
    }

    private String calculateMembershipDuration(LocalDateTime createdAt) {
        if (createdAt == null)
            return "Unknown";

        long months = ChronoUnit.MONTHS.between(createdAt, LocalDateTime.now());
        if (months < 1)
            return "New member";
        if (months < 12)
            return months + " months";
        return (months / 12) + " years";
    }

    private Integer calculateVisitCount(Customer customer) {
        // This would typically query appointment/case count
        // For now, return a placeholder
        return 0; // TODO: Implement actual visit count
    }

    private java.math.BigDecimal calculateAverageOrderValue(Customer customer) {
        if (customer.getTotalSpent() == null)
            return java.math.BigDecimal.ZERO;
        Integer totalOrders = calculateTotalOrders(customer);
        if (totalOrders == 0)
            return java.math.BigDecimal.ZERO;
        return customer.getTotalSpent().divide(java.math.BigDecimal.valueOf(totalOrders), 2,
                java.math.RoundingMode.HALF_UP);
    }

    private Integer calculateTotalOrders(Customer customer) {
        // TODO: Implement actual order count
        return 0;
    }

    private String determineCustomerSegment(Customer customer) {
        if (customer.getTotalSpent() == null)
            return "NEW";

        java.math.BigDecimal spent = customer.getTotalSpent();
        TierCode tier = customer.getTier().getCode();

        if (tier == TierCode.VIP)
            return "VIP";
        if (spent.compareTo(java.math.BigDecimal.valueOf(5000000)) > 0)
            return "HIGH_VALUE";
        if (spent.compareTo(java.math.BigDecimal.valueOf(1000000)) > 0)
            return "REGULAR";
        return "NEW";
    }

    private String calculateLastVisit(Customer customer) {
        // TODO: Implement last appointment/case date
        return "Unknown";
    }

    private String assessChurnRisk(Customer customer) {
        // TODO: Implement churn risk assessment based on last visit, spending pattern
        return "LOW";
    }
}
