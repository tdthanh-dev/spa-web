package com.htttql.crmmodule.lead.service;

import com.htttql.crmmodule.lead.dto.LeadRequest;

/**
 * Interface for lead validation operations
 * Decouples lead module from core module dependencies
 */
public interface ILeadValidator {

    /**
     * Validate if phone number already exists as a customer
     * @param phone Phone number to check
     * @return true if customer exists, false otherwise
     */
    boolean isExistingCustomer(String phone);

    /**
     * Get customer ID by phone number if exists
     * @param phone Phone number to check
     * @return customer ID or null if not found
     */
    Long getCustomerIdByPhone(String phone);

    /**
     * Check if the lead request is valid for creation
     * @param request Lead request to validate
     * @return true if valid, false otherwise
     */
    boolean isValidLeadRequest(LeadRequest request);
}
