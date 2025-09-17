package com.htttql.crmmodule.lead.exception;

/**
 * Exception thrown when a lead operation fails
 */
public class LeadOperationException extends RuntimeException {

    public LeadOperationException(String message) {
        super(message);
    }

    public LeadOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
