package com.htttql.crmmodule.core.entity;

import com.htttql.crmmodule.common.config.SchemaConstants;
import com.htttql.crmmodule.common.entity.BaseEntity;
import com.htttql.crmmodule.common.enums.PermissionType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Permission entity for fine-grained access control
 */
@Entity
@Table(name = "permission", schema = SchemaConstants.CORE_SCHEMA, indexes = {
        @Index(name = "idx_permission_type", columnList = "permission_type"),
        @Index(name = "idx_permission_code", columnList = "code", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "permission_seq")
    @SequenceGenerator(name = "permission_seq", sequenceName = SchemaConstants.CORE_SCHEMA
            + ".permission_seq", allocationSize = 1)
    @Column(name = "permission_id")
    private Long permissionId;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_type", nullable = false, length = 50)
    private PermissionType permissionType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_system_permission")
    @Builder.Default
    private Boolean isSystemPermission = false;

    @Column(name = "resource_type", length = 50)
    private String resourceType; // CUSTOMER, APPOINTMENT, INVOICE, etc.

    @Column(name = "action", length = 50)
    private String action; // READ, WRITE, DELETE, etc.

    @PrePersist
    @PreUpdate
    private void normalizeData() {
        if (code != null) {
            code = code.toUpperCase().trim();
        }
        if (name != null) {
            name = name.trim();
        }
    }

    /**
     * Check if this permission matches the given resource and action
     */
    public boolean matches(String resource, String action) {
        return this.resourceType != null && this.action != null
                && this.resourceType.equalsIgnoreCase(resource)
                && this.action.equalsIgnoreCase(action);
    }
}
