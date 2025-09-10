package com.htttql.crmmodule.common.enums;

/**
 * Permission types for customer data access control
 */
public enum PermissionType {
    // Basic customer information access
    VIEW_CUSTOMER_BASIC, // View name, phone, email
    VIEW_CUSTOMER_DETAILS, // View full profile including DOB, address
    VIEW_CUSTOMER_FINANCIAL, // View spending history, points, tier
    VIEW_CUSTOMER_HISTORY, // View appointment history, service records

    // Customer management permissions
    CREATE_CUSTOMER, // Create new customers
    UPDATE_CUSTOMER_BASIC, // Update basic information
    UPDATE_CUSTOMER_DETAILS, // Update detailed information
    DELETE_CUSTOMER, // Delete customer records

    // Appointment permissions
    VIEW_APPOINTMENTS, // View customer appointments
    MANAGE_APPOINTMENTS, // Create/update/delete appointments

    // Invoice and payment permissions
    VIEW_INVOICES, // View customer invoices
    MANAGE_INVOICES, // Create/update invoices
    VIEW_PAYMENTS, // View payment records

    // Special permissions
    VIEW_SENSITIVE_DATA, // View sensitive medical/health data
    EXPORT_CUSTOMER_DATA, // Export customer data
    BULK_OPERATIONS // Perform bulk operations on customers
}
