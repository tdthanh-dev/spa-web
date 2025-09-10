package com.htttql.crmmodule.service.dto;

import com.htttql.crmmodule.common.enums.PhotoType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for CasePhoto entity
 * Used for creating and updating case photos
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CasePhotoRequest {

    @NotNull(message = "Case ID is required")
    private Long caseId;

    @NotNull(message = "Photo type is required")
    private PhotoType type;

    private String note;

    private Boolean isPrimary;

    private Boolean isPublic;

    private Boolean consentForMarketing;

    private Boolean anonymized;
}
