package com.htttql.crmmodule.lead.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Appointment Response DTO - Booking information
 * Depth = 1: Includes shallow references to related entities
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AppointmentResponse {

    private Long apptId;

    // Lead/Customer info (shallow)
    private Long leadId;
    private String leadName;
    private Long customerId;
    private String customerName;
    private String customerPhone;

    // Service info (shallow)
    private Long serviceId;
    private String serviceName;
    private String serviceCategory;

    // Staff info (shallow)
    private Long technicianId;
    private String technicianName;
    private Long receptionistId;
    private String receptionistName;

    // Appointment details
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private AppointmentStatus status;
    private String note;

    // Tracking fields
    private Boolean reminderSent;
    private LocalDateTime confirmedAt;
    private String cancelledReason;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    public boolean isUpcoming() {
        return startAt != null && startAt.isAfter(LocalDateTime.now());
    }

    public boolean isToday() {
        return startAt != null &&
                startAt.toLocalDate().equals(LocalDateTime.now().toLocalDate());
    }

    public boolean isPast() {
        return endAt != null && endAt.isBefore(LocalDateTime.now());
    }

    public String getDisplayStatus() {
        if (status == null)
            return "Unknown";
        return switch (status) {
            case SCHEDULED -> "Đã lên lịch";
            case CONFIRMED -> "Đã xác nhận";
            case DONE -> "Hoàn thành";
            case CANCELLED -> "Đã hủy";
            case NO_SHOW -> "Không đến";
        };
    }

    public Integer getDurationMinutes() {
        if (startAt != null && endAt != null) {
            return (int) java.time.Duration.between(startAt, endAt).toMinutes();
        }
        return null;
    }

    public String getDurationDisplay() {
        Integer minutes = getDurationMinutes();
        if (minutes == null)
            return "N/A";
        if (minutes < 60) {
            return minutes + " phút";
        } else {
            int hours = minutes / 60;
            int mins = minutes % 60;
            return hours + "h" + (mins > 0 ? mins + "m" : "");
        }
    }
}