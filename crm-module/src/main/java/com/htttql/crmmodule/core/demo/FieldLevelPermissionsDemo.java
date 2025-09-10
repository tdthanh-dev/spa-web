package com.htttql.crmmodule.core.demo;

import com.htttql.crmmodule.common.enums.PermissionScope;
import com.htttql.crmmodule.core.dto.FieldPermissionSummaryDTO;
import com.htttql.crmmodule.core.dto.GrantFieldPermissionRequest;
import com.htttql.crmmodule.core.service.IPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Demo class showing how to use field-level permissions
 * This demonstrates various permission scenarios
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FieldLevelPermissionsDemo {

    private final IPermissionService permissionService;

    /**
     * Demo 1: Basic Receptionist - Can only view customer names and phones
     */
    public void setupBasicReceptionistPermissions(Long receptionistId) {
        log.info("🎯 Setting up BASIC receptionist permissions for staff ID: {}", receptionistId);

        List<PermissionScope> basicScopes = Arrays.asList(
                PermissionScope.CUSTOMER_NAME_READ, // Can view names
                PermissionScope.CUSTOMER_PHONE_READ, // Can view phones
                PermissionScope.APPOINTMENT_VIEW, // Can view appointments
                PermissionScope.APPOINTMENT_CREATE // Can create appointments
        );

        permissionService.grantFieldPermissionsToStaff(receptionistId, basicScopes, 1L);

        log.info("✅ Basic receptionist can now:");
        log.info("   - View customer names and phone numbers");
        log.info("   - View and create appointments");
        log.info("   - CANNOT view emails, addresses, financial data");
    }

    /**
     * Demo 2: Senior Receptionist - Can view and edit most customer data
     */
    public void setupSeniorReceptionistPermissions(Long receptionistId) {
        log.info("🎯 Setting up SENIOR receptionist permissions for staff ID: {}", receptionistId);

        List<PermissionScope> seniorScopes = Arrays.asList(
                // Read permissions
                PermissionScope.CUSTOMER_NAME_READ,
                PermissionScope.CUSTOMER_PHONE_READ,
                PermissionScope.CUSTOMER_EMAIL_READ,
                PermissionScope.CUSTOMER_ADDRESS_READ,
                PermissionScope.CUSTOMER_NOTES_READ,

                // Write permissions
                PermissionScope.CUSTOMER_NAME_WRITE,
                PermissionScope.CUSTOMER_PHONE_WRITE,
                PermissionScope.CUSTOMER_EMAIL_WRITE,
                PermissionScope.CUSTOMER_NOTES_WRITE,

                // Appointment management
                PermissionScope.APPOINTMENT_VIEW,
                PermissionScope.APPOINTMENT_CREATE,
                PermissionScope.APPOINTMENT_UPDATE,

                // Invoice viewing
                PermissionScope.INVOICE_VIEW,
                PermissionScope.INVOICE_CREATE);

        permissionService.grantFieldPermissionsToStaff(receptionistId, seniorScopes, 1L);

        log.info("✅ Senior receptionist can now:");
        log.info("   - View and edit: name, phone, email, notes");
        log.info("   - View address (but cannot edit)");
        log.info("   - Full appointment management");
        log.info("   - View and create invoices");
        log.info("   - CANNOT view financial data or delete customers");
    }

    /**
     * Demo 3: Customer-Specific Permissions - Limited access to specific customers
     */
    public void setupCustomerSpecificPermissions(Long staffId, Long customerId) {
        log.info("🎯 Setting up customer-specific permissions for staff ID: {} on customer ID: {}",
                staffId, customerId);

        List<PermissionScope> customerScopes = Arrays.asList(
                PermissionScope.CUSTOMER_NAME_READ,
                PermissionScope.CUSTOMER_PHONE_READ,
                PermissionScope.APPOINTMENT_VIEW,
                PermissionScope.APPOINTMENT_UPDATE);

        permissionService.grantCustomerFieldPermissions(staffId, customerId, customerScopes, 1L);

        log.info("✅ Staff can now manage only customer ID: {}", customerId);
        log.info("   - View name and phone for this customer");
        log.info("   - View and update appointments for this customer");
        log.info("   - CANNOT access other customers' data");
    }

    /**
     * Demo 4: Temporary Permissions - Permissions that expire
     */
    public void setupTemporaryPermissions(Long staffId, int hoursValid) {
        log.info("🎯 Setting up temporary permissions for staff ID: {} (valid for {} hours)",
                staffId, hoursValid);

        LocalDateTime expiresAt = LocalDateTime.now().plusHours(hoursValid);

        GrantFieldPermissionRequest request = GrantFieldPermissionRequest.builder()
                .staffId(staffId)
                .permissionScopes(Arrays.asList(
                        PermissionScope.CUSTOMER_TOTAL_SPENT_READ,
                        PermissionScope.CUSTOMER_TOTAL_POINTS_READ,
                        PermissionScope.HISTORY_VIEW))
                .expiresAt(expiresAt)
                .notes("Temporary access for financial audit - expires in " + hoursValid + " hours")
                .build();

        permissionService.grantFieldPermissionsToStaff(staffId, request.getPermissionScopes(), 1L);

        log.info("✅ Temporary permissions granted:");
        log.info("   - Can view financial data and customer history");
        log.info("   - Expires at: {}", expiresAt);
    }

    /**
     * Demo 5: Check Current Permissions Summary
     */
    public void displayPermissionSummary(Long staffId, Long customerId) {
        log.info("🎯 Permission summary for staff ID: {} on customer ID: {}", staffId, customerId);

        FieldPermissionSummaryDTO summary = new FieldPermissionSummaryDTO();
        summary.setStaffId(staffId);
        summary.setCustomerId(customerId);

        // Check individual permissions
        summary.setCanReadName(permissionService.canReadCustomerName(staffId, customerId));
        summary.setCanReadPhone(permissionService.canReadCustomerPhone(staffId, customerId));
        summary.setCanReadEmail(permissionService.canReadCustomerEmail(staffId, customerId));
        summary.setCanReadAddress(permissionService.canReadCustomerAddress(staffId, customerId));
        summary.setCanReadTotalSpent(permissionService.canViewCustomerFinancial(staffId, customerId));
        summary.setCanReadTotalPoints(permissionService.canViewCustomerFinancial(staffId, customerId));
        summary.setCanViewAppointments(permissionService.canManageCustomerAppointments(staffId, customerId));
        summary.setCanCreateAppointments(permissionService.canManageCustomerAppointments(staffId, customerId));

        summary.setReadableFields(permissionService.getReadableFieldsForCustomer(staffId, customerId));
        summary.setWritableFields(permissionService.getWritableFieldsForCustomer(staffId, customerId));

        summary.calculatePermissionLevel();

        log.info("📊 Permission Level: {}", summary.getPermissionLevel());
        log.info("📖 Readable Fields: {}", summary.getReadableFields());
        log.info("✏️ Writable Fields: {}", summary.getWritableFields());
        log.info("🎯 Total Permissions: {}/{}", summary.getTotalPermissions(),
                PermissionScope.values().length);
    }

    /**
     * Demo 6: Revoke Specific Permissions
     */
    public void revokeSpecificPermissions(Long staffId, Long customerId) {
        log.info("🎯 Revoking permissions for staff ID: {} on customer ID: {}", staffId, customerId);

        // Revoke specific scopes
        permissionService.revokeFieldPermission(staffId, PermissionScope.CUSTOMER_PHONE_READ, customerId);
        permissionService.revokeFieldPermission(staffId, PermissionScope.CUSTOMER_EMAIL_WRITE, customerId);

        log.info("✅ Revoked permissions:");
        log.info("   - Can no longer view phone numbers");
        log.info("   - Can no longer edit email addresses");
    }

    /**
     * Run Complete Demo Scenario
     */
    public void runCompleteDemo() {
        log.info("🚀 Starting Field-Level Permissions Demo");

        // Simulate different staff members
        Long basicReceptionistId = 2L;
        Long seniorReceptionistId = 3L;
        Long temporaryAuditorId = 4L;
        Long customerId = 10L;

        try {
            // Setup different permission levels
            setupBasicReceptionistPermissions(basicReceptionistId);
            Thread.sleep(1000);

            setupSeniorReceptionistPermissions(seniorReceptionistId);
            Thread.sleep(1000);

            setupCustomerSpecificPermissions(temporaryAuditorId, customerId);
            Thread.sleep(1000);

            setupTemporaryPermissions(temporaryAuditorId, 8);
            Thread.sleep(1000);

            // Display permission summaries
            log.info("\n" + "=".repeat(60));
            displayPermissionSummary(basicReceptionistId, customerId);
            log.info("\n" + "=".repeat(60));
            displayPermissionSummary(seniorReceptionistId, customerId);
            log.info("\n" + "=".repeat(60));
            displayPermissionSummary(temporaryAuditorId, customerId);

            // Demonstrate permission revocation
            log.info("\n" + "=".repeat(60));
            revokeSpecificPermissions(seniorReceptionistId, customerId);
            displayPermissionSummary(seniorReceptionistId, customerId);

        } catch (Exception e) {
            log.error("Error running demo: ", e);
        }

        log.info("✅ Field-Level Permissions Demo completed!");
    }
}
