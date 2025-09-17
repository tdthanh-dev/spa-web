package com.htttql.crmmodule.core.dto;

import com.htttql.crmmodule.common.enums.PermissionLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing field-level permissions for a staff member
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffFieldPermissions {

    private Long staffId;

    // Customer field permissions
    private PermissionLevel customerName;
    private PermissionLevel customerPhone;
    private PermissionLevel customerEmail;
    private PermissionLevel customerDob;
    private PermissionLevel customerGender;
    private PermissionLevel customerAddress;
    private PermissionLevel customerNotes;

    // Financial data permissions
    private PermissionLevel customerTotalSpent;
    private PermissionLevel customerTotalPoints;
    private PermissionLevel customerTier;
    private PermissionLevel customerVipStatus;

    // Appointment permissions
    private PermissionLevel appointmentView;
    private PermissionLevel appointmentCreate;
    private PermissionLevel appointmentUpdate;
    private PermissionLevel appointmentCancel;

    // Invoice permissions
    private PermissionLevel invoiceView;
    private PermissionLevel invoiceCreate;
    private PermissionLevel invoiceUpdate;

    // History permissions
    private PermissionLevel historyView;
    private PermissionLevel historyExport;
}