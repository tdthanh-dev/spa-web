package com.htttql.crmmodule.lead.exception;

/**
 * Exception thrown when a lead is not found
 */
public class LeadNotFoundException extends RuntimeException {

    public LeadNotFoundException(Long leadId) {
        super("Lead not found with id: " + leadId);
    }

    public LeadNotFoundException(String message) {
        super(message);
    }
}
