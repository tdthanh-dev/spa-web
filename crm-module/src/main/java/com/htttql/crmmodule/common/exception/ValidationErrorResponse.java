package com.htttql.crmmodule.common.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Structured validation error response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorResponse {

    /**
     * Field-specific validation errors
     * Map of field name to error message
     */
    private Map<String, String> fieldErrors;

    /**
     * Global validation errors (not tied to specific fields)
     */
    private List<String> globalErrors;

    /**
     * Total number of validation errors
     */
    public int getTotalErrors() {
        int count = 0;
        if (fieldErrors != null) {
            count += fieldErrors.size();
        }
        if (globalErrors != null) {
            count += globalErrors.size();
        }
        return count;
    }
}
