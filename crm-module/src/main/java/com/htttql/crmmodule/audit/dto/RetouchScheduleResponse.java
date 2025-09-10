package com.htttql.crmmodule.audit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.RetouchStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * RetouchSchedule Response DTO - Retouch appointment information
 * Depth = 1: Includes case and service info without full nested objects
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RetouchScheduleResponse {

    private Long retouchId;

    // Case info (shallow)
    private Long caseId;
    private String caseCustomerName;
    private String caseServiceName;

    // Schedule details
    private LocalDateTime dueAt;
    private LocalDateTime scheduledAt;
    private RetouchStatus status;

    // Completion info
    private LocalDateTime completedAt;

    // Reminder settings
    private Boolean reminderSent;
    private LocalDateTime reminderSentAt;
    private Integer daysBeforeReminder;

    // Business rules
    private Boolean isFreeRetouch;
    private Integer discountPercentage;

    // Notes
    private String note;
    private String cancellationReason;

    // Reschedule info
    private LocalDateTime rescheduledFrom;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    public boolean isOverdue() {
        return status == RetouchStatus.PLANNED && LocalDateTime.now().isAfter(dueAt);
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
        return dueAt.isAfter(now) && dueAt.isBefore(now.plusDays(daysBeforeReminder != null ? daysBeforeReminder : 3));
    }

    public boolean shouldSendReminder() {
        if (reminderSent == null || reminderSent || status != RetouchStatus.PLANNED) {
            return false;
        }

        LocalDateTime reminderDate = dueAt.minusDays(daysBeforeReminder != null ? daysBeforeReminder : 3);
        return LocalDateTime.now().isAfter(reminderDate);
    }

    public String getDisplayStatus() {
        if (status == null)
            return "Unknown";
        return switch (status) {
            case PLANNED -> "Đã lên lịch";
            case DONE -> "Hoàn thành";
            case MISSED -> "Đã bỏ lỡ";
        };
    }

    public String getDiscountDisplay() {
        if (discountPercentage == null || discountPercentage == 0)
            return "Không giảm giá";
        return discountPercentage + "% giảm giá";
    }

    public String getDaysUntilDue() {
        if (dueAt == null)
            return "N/A";
        long days = java.time.Duration.between(LocalDateTime.now(), dueAt).toDays();
        if (days == 0)
            return "Hôm nay";
        if (days == 1)
            return "Ngày mai";
        if (days == -1)
            return "Hôm qua";
        if (days > 0)
            return "Còn " + days + " ngày";
        return "Quá hạn " + Math.abs(days) + " ngày";
    }
}