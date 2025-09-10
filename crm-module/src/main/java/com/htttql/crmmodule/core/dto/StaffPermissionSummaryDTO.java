package com.htttql.crmmodule.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for summarizing staff permissions for customer access
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffPermissionSummaryDTO {
    private Long staffId;
    private String staffName;
    private Long customerId;
    private String customerName;

    // Customer field permissions
    private boolean canReadName;
    private boolean canWriteName;
    private boolean canReadPhone;
    private boolean canWritePhone;
    private boolean canReadEmail;
    private boolean canWriteEmail;
    private boolean canReadAddress;
    private boolean canWriteAddress;
    private boolean canReadDOB;
    private boolean canWriteDOB;
    private boolean canReadNotes;
    private boolean canWriteNotes;
    private boolean canReadGender;
    private boolean canWriteGender;

    // Financial permissions
    private boolean canReadTotalSpent;
    private boolean canReadTotalPoints;
    private boolean canReadTier;
    private boolean canReadVipStatus;

    // Action permissions
    private boolean canViewAppointments;
    private boolean canCreateAppointments;
    private boolean canUpdateAppointments;
    private boolean canCancelAppointments;

    private boolean canViewInvoices;
    private boolean canCreateInvoices;
    private boolean canUpdateInvoices;

    private boolean canViewHistory;
    private boolean canExportData;
    private boolean canDeleteCustomer;

    // Bulk permissions
    private boolean canBulkExport;
    private boolean canBulkUpdate;

    // Computed fields
    private int totalPermissions;
    private int readableFieldsCount;
    private int writableFieldsCount;
    private java.util.List<String> readableFields;
    private java.util.List<String> writableFields;
    private java.util.Map<String, Boolean> fieldPermissions;

    // Permission level assessment
    private String permissionLevel;

    public void calculatePermissionLevel() {
        int score = 0;
        if (canReadName)
            score += 1;
        if (canReadPhone)
            score += 1;
        if (canReadEmail)
            score += 1;
        if (canWriteName || canWritePhone || canWriteEmail)
            score += 2;
        if (canViewAppointments)
            score += 1;
        if (canViewInvoices)
            score += 1;
        if (canCreateAppointments || canCreateInvoices)
            score += 2;
        if (canReadTotalSpent || canReadTotalPoints)
            score += 2;
        if (canDeleteCustomer)
            score += 5;

        if (score == 0) {
            permissionLevel = "NONE";
        } else if (score <= 3) {
            permissionLevel = "BASIC";
        } else if (score <= 7) {
            permissionLevel = "EXTENDED";
        } else if (score <= 12) {
            permissionLevel = "FULL";
        } else {
            permissionLevel = "ADMIN";
        }
    }
}
