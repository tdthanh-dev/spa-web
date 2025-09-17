package com.htttql.crmmodule.core.entity;

import com.htttql.crmmodule.common.enums.PermissionLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing field-level permissions for a staff member
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "staff_field_permissions")
public class StaffFieldPermissionsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_field_permissions_seq")
    @SequenceGenerator(name = "staff_field_permissions_seq", sequenceName = "staff_field_permissions_seq", allocationSize = 1)
    private Long id;

    @Column(name = "staff_id", nullable = false, unique = true)
    private Long staffId;

    // Customer field permissions
    @Enumerated(EnumType.STRING)
    @Column(name = "customer_name")
    private PermissionLevel customerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_phone")
    private PermissionLevel customerPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_email")
    private PermissionLevel customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_dob")
    private PermissionLevel customerDob;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_gender")
    private PermissionLevel customerGender;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_address")
    private PermissionLevel customerAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_notes")
    private PermissionLevel customerNotes;

    // Financial data permissions
    @Enumerated(EnumType.STRING)
    @Column(name = "customer_total_spent")
    private PermissionLevel customerTotalSpent;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_total_points")
    private PermissionLevel customerTotalPoints;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_tier")
    private PermissionLevel customerTier;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_vip_status")
    private PermissionLevel customerVipStatus;

    // Appointment permissions
    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_view")
    private PermissionLevel appointmentView;

    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_create")
    private PermissionLevel appointmentCreate;

    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_update")
    private PermissionLevel appointmentUpdate;

    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_cancel")
    private PermissionLevel appointmentCancel;

    // Invoice permissions
    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_view")
    private PermissionLevel invoiceView;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_create")
    private PermissionLevel invoiceCreate;

    @Enumerated(EnumType.STRING)
    @Column(name = "invoice_update")
    private PermissionLevel invoiceUpdate;

    // History permissions
    @Enumerated(EnumType.STRING)
    @Column(name = "history_view")
    private PermissionLevel historyView;

    @Enumerated(EnumType.STRING)
    @Column(name = "history_export")
    private PermissionLevel historyExport;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}