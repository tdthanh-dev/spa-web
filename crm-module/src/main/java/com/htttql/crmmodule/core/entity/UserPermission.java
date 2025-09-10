package com.htttql.crmmodule.core.entity;

import com.htttql.crmmodule.common.config.SchemaConstants;
import com.htttql.crmmodule.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * UserPermission entity for managing staff permissions on customer data
 */
@Entity
@Table(name = "user_permission", schema = SchemaConstants.CORE_SCHEMA, indexes = {
        @Index(name = "idx_user_permission_staff", columnList = "staff_id"),
        @Index(name = "idx_user_permission_customer", columnList = "customer_id"),
        @Index(name = "idx_user_permission_permission", columnList = "permission_id"),
        @Index(name = "idx_user_permission_unique", columnList = "staff_id, permission_id, customer_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPermission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_permission_seq")
    @SequenceGenerator(name = "user_permission_seq", sequenceName = SchemaConstants.CORE_SCHEMA
            + ".user_permission_seq", allocationSize = 1)
    @Column(name = "user_permission_id")
    private Long userPermissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_permission_staff"))
    private StaffUser staffUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_permission_permission"))
    private Permission permission;

    // Optional: restrict permission to specific customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", foreignKey = @ForeignKey(name = "fk_user_permission_customer"))
    private Customer customer;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "granted_by_staff_id")
    private Long grantedByStaffId; // Who granted this permission

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
        if (!isActive)
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
     * Check if this permission grants access to a specific resource and action
     */
    public boolean grantsAccess(String resourceType, String action, Long customerId) {
        if (!isValid())
            return false;
        if (!appliesToCustomer(customerId))
            return false;
        return permission.matches(resourceType, action);
    }
}
