package com.htttql.crmmodule.service.entity;

import com.htttql.crmmodule.common.config.SchemaConstants;
import com.htttql.crmmodule.common.entity.BaseEntity;
import com.htttql.crmmodule.common.enums.CaseStatus;
import com.htttql.crmmodule.common.enums.PaidStatus;
import com.htttql.crmmodule.core.entity.Customer;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Customer case entity for service records
 * Tracks each service session with photos, notes, and results
 */
@Entity
@Table(name = "customer_case", schema = SchemaConstants.SERVICE_SCHEMA, indexes = {
        @Index(name = "idx_case_customer", columnList = "customer_id"),
        @Index(name = "idx_case_service", columnList = "primary_service_id"),
        @Index(name = "idx_case_status", columnList = "status"),
        @Index(name = "idx_case_paid_status", columnList = "paid_status"),
        @Index(name = "idx_case_created", columnList = "created_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerCase extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "case_seq")
    @SequenceGenerator(name = "case_seq", sequenceName = SchemaConstants.SERVICE_SCHEMA
            + ".customer_case_seq", allocationSize = 1)
    @Column(name = "case_id")
    private Long caseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_case_customer"))
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_service_id", foreignKey = @ForeignKey(name = "fk_case_primary_service"))
    private SpaService primaryService;

    @Column(name = "intake_note", columnDefinition = "TEXT")
    private String intakeNote;

    @Type(JsonType.class)
    @Column(name = "contraindication_flags", columnDefinition = "jsonb")
    private Map<String, Object> contraindicationFlags;

    @Column(name = "consent_signed_at", columnDefinition = "TIMESTAMPTZ")
    private LocalDateTime consentSignedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CaseStatus status = CaseStatus.INTAKE;

    @Enumerated(EnumType.STRING)
    @Column(name = "paid_status", nullable = true, length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'UNPAID'")
    @Builder.Default
    private PaidStatus paidStatus = PaidStatus.UNPAID;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // Relationships
    @OneToMany(mappedBy = "customerCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CaseService> caseServices = new ArrayList<>();

    @OneToMany(mappedBy = "customerCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TechnicianNote> technicianNotes = new ArrayList<>();

    @OneToMany(mappedBy = "customerCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CasePhoto> casePhotos = new ArrayList<>();

    @Column(name = "total_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "has_after_photo")
    @Builder.Default
    private Boolean hasAfterPhoto = false;

    // Helper methods
    public void addCaseService(CaseService caseService) {
        caseServices.add(caseService);
        caseService.setCustomerCase(this);
        // Calculate line total before adding to total amount
        if (caseService.getLineTotal() == null) {
            caseService.calculateLineTotal();
        }
        this.totalAmount = this.totalAmount.add(caseService.getLineTotal());
    }

    public void removeCaseService(CaseService caseService) {
        caseServices.remove(caseService);
        caseService.setCustomerCase(null);
        this.totalAmount = this.totalAmount.subtract(caseService.getLineTotal());
    }

    public void recalculateTotalAmount() {
        this.totalAmount = caseServices.stream()
                .filter(service -> service.getLineTotal() != null)
                .map(service -> service.getLineTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void addTechnicianNote(TechnicianNote note) {
        technicianNotes.add(note);
        note.setCustomerCase(this);
    }

    @PostLoad
    private void postLoad() {
        if (paidStatus == null) {
            paidStatus = PaidStatus.UNPAID;
        }
        // Ensure totalAmount is calculated if not set (for backward compatibility)
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) == 0) {
            recalculateTotalAmount();
        }
    }
    }
