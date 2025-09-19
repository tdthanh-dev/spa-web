package com.htttql.crmmodule.service.entity;

import com.htttql.crmmodule.common.config.SchemaConstants;
import com.htttql.crmmodule.common.entity.BaseEntity;
import com.htttql.crmmodule.common.enums.PhotoType;
import com.htttql.crmmodule.core.entity.StaffUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "case_photo", schema = SchemaConstants.SERVICE_SCHEMA, indexes = {
        @Index(name = "idx_case_photo_case", columnList = "case_id"),
        @Index(name = "idx_case_photo_type", columnList = "type"),
        @Index(name = "idx_case_photo_taken_at", columnList = "taken_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CasePhoto extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "photo_seq")
    @SequenceGenerator(name = "photo_seq",
            sequenceName = SchemaConstants.SERVICE_SCHEMA + ".case_photo_seq",
            allocationSize = 1)
    @Column(name = "photo_id")
    private Long photoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false, foreignKey = @ForeignKey(name = "fk_photo_case"))
    private CustomerCase customerCase;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private PhotoType type; // BEFORE / AFTER

    /** Đường dẫn lưu trữ tương đối trong thư mục upload (không phải URL API) */
    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath; // ví dụ: 123/456/2025/09/18/uuid.jpg

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "taken_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime takenAt;

    /** Có thể null nếu không resolve được từ SecurityContext */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "taken_by", nullable = true, foreignKey = @ForeignKey(name = "fk_photo_staff"))
    private StaffUser takenBy;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @PrePersist
    protected void onCreate() {
        super.onCreate();
        if (takenAt == null) takenAt = OffsetDateTime.now();
    }
}
