package com.htttql.crmmodule.lead.factory;

import com.htttql.crmmodule.lead.dto.LeadPublicResponse;
import com.htttql.crmmodule.lead.dto.LeadResponse;
import com.htttql.crmmodule.lead.entity.Lead;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Lead Data Transform Factory - Secure lead data transformation
 * Handles data mapping and privacy controls
 * Moved from common to lead module for better domain grouping
 */
@Component("leadDataTransformFactory")
@RequiredArgsConstructor
public class LeadDataTransformFactory {

    /**
     * Create public response for external lead submission
     */
    public LeadPublicResponse createPublicResponse(Lead lead) {
        String referenceNumber = generateReferenceNumber(lead.getLeadId());

        return LeadPublicResponse.builder()
                .referenceNumber(referenceNumber)
                .message("Thank you for your interest! We will contact you within 24 hours.")
                .status("SUBMITTED")
                .build();
    }

    /**
     * Create internal response for staff management
     */
    public LeadResponse createInternalResponse(Lead lead) {
        return LeadResponse.builder()
                .leadId(lead.getLeadId())
                .fullName(lead.getFullName())
                .phone(maskPhone(lead.getPhone()))
                .note(lead.getNote())
                .status(lead.getStatus())
                .createdAt(lead.getCreatedAt())
                .customerId(lead.getCustomerId())
                .isExistingCustomer(lead.getIsExistingCustomer())
                .build();
    }

    /**
     * Create full response for managers (includes unmasked data)
     */
    public LeadResponse createManagerResponse(Lead lead) {
        return LeadResponse.builder()
                .leadId(lead.getLeadId())
                .fullName(lead.getFullName())
                .phone(lead.getPhone()) // Unmasked for managers
                .note(lead.getNote())
                .status(lead.getStatus())
                .createdAt(lead.getCreatedAt())
                .customerId(lead.getCustomerId())
                .isExistingCustomer(lead.getIsExistingCustomer())
                .build();
    }

    // Helper methods

    private String generateReferenceNumber(Long leadId) {
        // Create a public-safe reference number
        String prefix = "LD";
        String timestamp = String.valueOf(System.currentTimeMillis() % 1000000);
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return prefix + timestamp + suffix;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4)
            return phone;
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }
}
