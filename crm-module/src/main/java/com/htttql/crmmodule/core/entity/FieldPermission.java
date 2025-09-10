package com.htttql.crmmodule.core.entity;

import com.htttql.crmmodule.common.config.SchemaConstants;
import com.htttql.crmmodule.common.entity.BaseEntity;
import com.htttql.crmmodule.common.enums.PermissionScope;
import jakarta.persistence.*;
import lombok.*;

/**
 * FieldPermission entity for granular field-level access control
 */
@Entity
@Table(name = "field_permission", schema = SchemaConstants.CORE_SCHEMA, indexes = {
        @Index(name = "idx_field_permission_staff", columnList = "staff_id"),
        @Index(name = "idx_field_permission_customer", columnList = "customer_id"),
        @Index(name = "idx_field_permission_scope", columnList = "permission_scope"),
        @Index(name = "idx_field_permission_unique", columnList = "staff_id, permission_scope, customer_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FieldPermission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "field_permission_seq")
    @SequenceGenerator(name = "field_permission_seq", sequenceName = SchemaConstants.CORE_SCHEMA
            + ".field_permission_seq", allocationSize = 1)
    @Column(name = "field_permission_id")
    private Long fieldPermissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false, foreignKey = @ForeignKey(name = "fk_field_permission_staff"))
    private StaffUser staffUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_scope", nullable = false, length = 50)
    private PermissionScope permissionScope;

    // Optional: restrict permission to specific customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", foreignKey = @ForeignKey(name = "fk_field_permission_customer"))
    private Customer customer;

    @Column(name = "is_granted")
    @Builder.Default
    private Boolean isGranted = true;

    @Column(name = "granted_by_staff_id")
    private Long grantedByStaffId;

    @Column(name = "granted_at", columnDefinition = "TIMESTAMPTZ")
    private java.time.LocalDateTime grantedAt;

    @Column(name = "expires_at", columnDefinition = "TIMESTAMPTZ")
    private java.time.LocalDateTime expiresAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Check if this permission is currently valid
     */
    public boolean isValid() {
        if (!isGranted)
            return false;
        if (expiresAt != null && expiresAt.isBefore(java.time.LocalDateTime.now()))
            return false;
        return true;
    }

    /**
     * Check if this permission applies to a specific customer
     */
    public boolean appliesToCustomer(Long customerId) {
        // If no specific customer restriction, allow all
        if (customer == null)
            return true;
        // If specific customer restriction, check match
        return customer.getCustomerId().equals(customerId);
    }

    /**
     * Check if this permission grants access for the given scope and customer
     */
    public boolean grantsAccess(PermissionScope scope, Long customerId) {
        if (!isValid())
            return false;
        if (!this.permissionScope.equals(scope))
            return false;
        if (!appliesToCustomer(customerId))
            return false;
        return true;
    }

    /**
     * Get the field name this permission applies to
     */
    public String getFieldName() {
        return permissionScope.name().toLowerCase().replace("customer_", "").replace("_read", "").replace("_write", "");
    }

    /**
     * Get the action type (READ/WRITE/DELETE)
     */
    public String getActionType() {
        String scopeName = permissionScope.name();
        if (scopeName.endsWith("_READ"))
            return "READ";
        if (scopeName.endsWith("_WRITE"))
            return "WRITE";
        if (scopeName.endsWith("_DELETE"))
            return "DELETE";
        if (scopeName.endsWith("_CREATE"))
            return "CREATE";
        if (scopeName.endsWith("_UPDATE"))
            return "UPDATE";
        if (scopeName.endsWith("_VIEW"))
            return "VIEW";
        if (scopeName.endsWith("_CANCEL"))
            return "CANCEL";
        if (scopeName.endsWith("_EXPORT"))
            return "EXPORT";
        if (scopeName.endsWith("_RESTORE"))
            return "RESTORE";
        return "UNKNOWN";
    }
}
