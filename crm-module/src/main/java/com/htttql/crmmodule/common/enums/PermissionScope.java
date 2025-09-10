package com.htttql.crmmodule.common.enums;

/**
 * Permission scopes for field-level access control
 */
public enum PermissionScope {
    // Basic customer fields
    CUSTOMER_NAME_READ, // View customer's full name
    CUSTOMER_NAME_WRITE, // Edit customer's full name

    CUSTOMER_PHONE_READ, // View customer's phone number
    CUSTOMER_PHONE_WRITE, // Edit customer's phone number

    CUSTOMER_EMAIL_READ, // View customer's email
    CUSTOMER_EMAIL_WRITE, // Edit customer's email

    CUSTOMER_DOB_READ, // View customer's date of birth
    CUSTOMER_DOB_WRITE, // Edit customer's date of birth

    CUSTOMER_GENDER_READ, // View customer's gender
    CUSTOMER_GENDER_WRITE, // Edit customer's gender

    CUSTOMER_ADDRESS_READ, // View customer's address
    CUSTOMER_ADDRESS_WRITE, // Edit customer's address

    CUSTOMER_NOTES_READ, // View customer's notes
    CUSTOMER_NOTES_WRITE, // Edit customer's notes

    // Financial fields
    CUSTOMER_TOTAL_SPENT_READ, // View total spent amount
    CUSTOMER_TOTAL_POINTS_READ, // View loyalty points
    CUSTOMER_TIER_READ, // View customer tier
    CUSTOMER_VIP_STATUS_READ, // View VIP status

    // Appointment fields
    APPOINTMENT_VIEW, // View customer's appointments
    APPOINTMENT_CREATE, // Create appointments for customer
    APPOINTMENT_UPDATE, // Update customer's appointments
    APPOINTMENT_CANCEL, // Cancel customer's appointments

    // Invoice fields
    INVOICE_VIEW, // View customer's invoices
    INVOICE_CREATE, // Create invoices for customer
    INVOICE_UPDATE, // Update customer's invoices

    // History access
    HISTORY_VIEW, // View customer's service history
    HISTORY_EXPORT, // Export customer's data

    // Bulk operations
    BULK_EXPORT, // Export multiple customers
    BULK_UPDATE, // Bulk update customers

    // Administrative
    CUSTOMER_DELETE, // Delete customer record
    CUSTOMER_RESTORE // Restore deleted customer
}
