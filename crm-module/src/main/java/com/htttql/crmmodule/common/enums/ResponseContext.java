package com.htttql.crmmodule.common.enums;

/**
 * Response context enum - Defines data exposure level
 */
public enum ResponseContext {

    // Minimal data for public/list views
    BASIC,

    // Detailed data for authorized staff
    DETAIL,

    // Full business data for managers
    BUSINESS,

    // Public submission responses (external)
    PUBLIC
}
