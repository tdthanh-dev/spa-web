package com.htttql.crmmodule.service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TechnicianNote Response DTO - Technician observations and notes
 * Includes technician info without full nested objects
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TechnicianNoteResponse {

    private Long noteId;

    // Case info (shallow)
    private Long caseId;

    // Technician info (shallow)
    private Long technicianId;
    private String technicianName;

    // Note content
    private String note;

    // Note type/category (if applicable)
    private String noteType;

    // Metadata
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;

    // Display helpers
    public String getDisplayNoteType() {
        if (noteType == null)
            return "Ghi chú";
        return switch (noteType.toLowerCase()) {
            case "observation" -> "Quan sát";
            case "treatment" -> "Điều trị";
            case "result" -> "Kết quả";
            case "followup" -> "Theo dõi";
            default -> noteType;
        };
    }

    public String getCreatedAtDisplay() {
        return createdAt != null ? createdAt.toString() : null;
    }
}
