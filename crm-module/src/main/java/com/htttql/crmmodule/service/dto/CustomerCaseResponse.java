package com.htttql.crmmodule.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.CaseStatus;
import com.htttql.crmmodule.common.enums.PaidStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * CustomerCase Response DTO - Service case information
 * Depth = 1: Includes basic customer and service info, not full objects
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerCaseResponse {

    private Long caseId;

    // Customer info (shallow)
    private Long customerId;
    private String customerName;
    private String customerPhone;

    // Primary service info (shallow)
    private Long primaryServiceId;
    private String primaryServiceName;
    private String primaryServiceCategory;

    // Case details
    private String intakeNote;
    private CaseStatus status;
    private PaidStatus paidStatus;
    private LocalDate startDate;
    private LocalDate endDate;

    // Photo flags
    private Boolean hasBeforePhoto;
    private Boolean hasAfterPhoto;

    // Case services summary
    private Integer servicesCount;
    private List<Long> serviceIds; // Max 3 for preview

    // Financial summary
    private BigDecimal totalAmount;

    // Technician notes summary
    private Integer notesCount;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    public boolean isActive() {
        return status != null && !status.name().equals("DONE") && !status.name().equals("FOLLOW_UP");
    }

    public String getDisplayStatus() {
        if (status == null)
            return "Unknown";
        return switch (status) {
            case INTAKE -> "Đang tiếp nhận";
            case IN_PROGRESS -> "Đang thực hiện";
            case DONE -> "Hoàn thành";
            case FOLLOW_UP -> "Cần theo dõi";
        };
    }
}