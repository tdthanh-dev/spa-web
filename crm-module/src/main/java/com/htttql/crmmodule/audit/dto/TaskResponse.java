package com.htttql.crmmodule.audit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.TaskStatus;
import com.htttql.crmmodule.common.enums.TaskType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Task Response DTO - Task and reminder information
 * Depth = 1: Includes assignee and related entity info without full nesting
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskResponse {

    private Long taskId;
    private String title;
    private TaskType type;
    private LocalDateTime dueAt;
    private TaskStatus status;

    // Assignee info (shallow)
    private Long assigneeId;
    private String assigneeName;
    private String assigneeRole;

    // Related entity info (shallow)
    private Long relatedLeadId;
    private String leadName;
    private Long relatedCaseId;
    private String caseCustomerName;

    // Task details
    private String note;
    private Integer priority;

    // Completion info
    private LocalDateTime completedAt;
    private Long completedById;
    private String completedByName;

    // Reminder settings
    private Boolean reminderSent;
    private LocalDateTime reminderSentAt;

    // Recurrence
    private Boolean isRecurring;
    private String recurrencePattern;

    // Contact info (for convenience)
    private String contactPhone;
    private String contactName;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    public boolean isOverdue() {
        return status == TaskStatus.OPEN && LocalDateTime.now().isAfter(dueAt);
    }

    public boolean isDueToday() {
        if (dueAt == null)
            return false;
        return dueAt.toLocalDate().equals(LocalDateTime.now().toLocalDate());
    }

    public boolean isDueSoon() {
        if (dueAt == null)
            return false;
        LocalDateTime now = LocalDateTime.now();
        return dueAt.isAfter(now) && dueAt.isBefore(now.plusDays(1));
    }

    public String getDisplayPriority() {
        if (priority == null)
            return "Normal";
        return switch (priority) {
            case 1 -> "Cao";
            case 2 -> "Trung bình";
            case 3 -> "Thấp";
            default -> "Normal";
        };
    }

    public String getDisplayType() {
        if (type == null)
            return "Unknown";
        return switch (type) {
            case FOLLOW_UP -> "Theo dõi";
            case CALL -> "Gọi điện";
            case RETOUCH_REMINDER -> "Nhắc lịch retouch";
        };
    }

    public String getDisplayStatus() {
        if (status == null)
            return "Unknown";
        return switch (status) {
            case OPEN -> "Mở";
            case DONE -> "Hoàn thành";
            case CANCELLED -> "Đã hủy";
        };
    }
}