package com.htttql.crmmodule.service.dto;

import com.htttql.crmmodule.common.enums.PhotoType;
import lombok.*;

import java.time.OffsetDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CasePhotoResponse {
    private Long photoId;
    private Long caseId;
    private PhotoType type;
    private String url;              // URL download build ở service: /api/photos/download/{photoId}
    private OffsetDateTime takenAt;
    private Long takenByStaffId;
    private String takenByStaffName;
    private String note;

    private String fileName;
    private Long fileSize;
    private String mimeType;

    private String storagePath;      // (tuỳ) xuất cho admin debug; có thể bỏ nếu không muốn lộ
}
