package com.htttql.crmmodule.service.dto;

import com.htttql.crmmodule.common.enums.PhotoType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for CasePhoto entity
 * Contains only essential information for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CasePhotoResponse {

    private Long photoId;
    private Long caseId;
    private PhotoType type;
    private String fileUrl;
    private LocalDateTime takenAt;
    private Long takenByStaffId;
    private String takenByStaffName;
    private String note;
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private Boolean isPrimary;
    private Boolean isPublic;
    private Boolean consentForMarketing;
    private Boolean anonymized;
    private LocalDateTime deletionRequestedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
