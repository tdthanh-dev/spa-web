package com.htttql.crmmodule.lead.dto;

import com.htttql.crmmodule.common.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Appointment creation/update
 * - Cho phép tạo từ lead hoặc customer (ít nhất một).
 * - technicianId là OPTIONAL (có thể null).
 * - receptionistId REQUIRED (entity đang nullable=false).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {

    // One-of: leadId or customerId
    private Long leadId;                // optional

    private Long customerId;            // optional (trước đây @NotNull, nay bỏ để cho phép lead-only)

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startAt;

    @NotNull(message = "End time is required")
    private LocalDateTime endAt;

    // Optional, mặc định SCHEDULED nếu null
    private AppointmentStatus status;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    // Technician là OPTIONAL
    private Long technicianId;          // có thể null

    // Receptionist là REQUIRED (entity nullable=false)
    @NotNull(message = "Receptionist ID is required")
    private Long receptionistId;
}
