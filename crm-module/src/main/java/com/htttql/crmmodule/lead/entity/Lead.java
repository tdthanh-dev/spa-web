package com.htttql.crmmodule.lead.entity;

import com.htttql.crmmodule.common.config.SchemaConstants;
import com.htttql.crmmodule.common.entity.BaseEntity;
import com.htttql.crmmodule.common.enums.LeadStatus;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Lead entity for potential customers - Simplified version
 * Only essential fields: name, phone, note + anti-spam/DDOS protection
 */
@Entity
@Table(name = "lead", schema = SchemaConstants.LEAD_SCHEMA, indexes = {
        @Index(name = "idx_lead_phone", columnList = "phone"),
        @Index(name = "idx_lead_status", columnList = "status"),
        @Index(name = "idx_lead_created", columnList = "created_at DESC"),
        @Index(name = "idx_lead_ip", columnList = "ip_address")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_lead_phone_date", columnNames = { "phone", "created_at" }),
        @UniqueConstraint(name = "uk_lead_ip_date", columnNames = { "ip_address", "created_at" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lead_seq")
    @SequenceGenerator(name = "lead_seq", sequenceName = SchemaConstants.LEAD_SCHEMA + ".lead_seq", allocationSize = 1)
    @Column(name = "lead_id")
    private Long leadId;

    // Core fields - 3 trường chính
    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // Anti-spam/DDOS protection fields
    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "is_existing_customer")
    private Boolean isExistingCustomer;

    // Legacy field for backward compatibility
    @Column(name = "created_date", columnDefinition = "TIMESTAMPTZ")
    private LocalDateTime createdDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private LeadStatus status = LeadStatus.NEW;

    @PrePersist
    protected void onCreate() {
        super.onCreate(); // Call parent method first
        if (createdDate == null) {
            createdDate = getCreatedAt(); // Sync createdDate with createdAt for backward compatibility
        }
    }
}
