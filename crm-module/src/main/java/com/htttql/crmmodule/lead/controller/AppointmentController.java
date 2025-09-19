package com.htttql.crmmodule.lead.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
import com.htttql.crmmodule.lead.dto.AppointmentRequest;
import com.htttql.crmmodule.lead.dto.AppointmentResponse;
import com.htttql.crmmodule.lead.service.IAppointmentService;
import com.htttql.crmmodule.common.dto.StatusUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Appointment Management Controller
 * Manages customer appointments and scheduling
 */
@Tag(name = "Appointment Management", description = "Customer appointments and scheduling management")
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final IAppointmentService appointmentService;

    @Operation(summary = "Get all appointments with pagination")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> getAllAppointments(Pageable pageable) {
        Page<AppointmentResponse> appointments = appointmentService.getAllAppointments(pageable);
        PageResponse<AppointmentResponse> response = PageResponse.from(appointments);
        return ResponseEntity.ok(ApiResponse.success(response, "Appointments retrieved successfully"));
    }

    @Operation(summary = "Get appointment by ID")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable Long id) {
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment, "Appointment retrieved successfully"));
    }

    @Operation(summary = "Create new appointment")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse appointment = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(appointment, "Appointment created successfully"));
    }

    @Operation(summary = "Update appointment")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse appointment = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success(appointment, "Appointment updated successfully"));
    }

    @Operation(summary = "Delete appointment")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully"));
    }

    @Operation(summary = "Get today's appointments")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    @GetMapping("/today")
    public ResponseEntity<Page<AppointmentResponse>> getTodayAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "apptId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Page<AppointmentResponse> appointments = appointmentService.getTodayAppointments(page, size, sortBy, sortDir);
        return ResponseEntity.ok(appointments);
    }

    @Operation(summary = "Get appointments by date range")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    @GetMapping("/calendar")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<AppointmentResponse> appointments = appointmentService.getAppointmentsByDateRange(startDate, endDate, page,
                size);
        return ResponseEntity.ok(appointments);
    }

    @Operation(summary = "Get technician's appointments")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'TECHNICIAN')")
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<Page<AppointmentResponse>> getTechnicianAppointments(
            @PathVariable Long technicianId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AppointmentResponse> appointments = appointmentService.getTechnicianAppointments(technicianId, page, size);
        return ResponseEntity.ok(appointments);
    }

    @Operation(summary = "Get customer's appointments")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> getCustomerAppointments(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AppointmentResponse> appointments = appointmentService.getCustomerAppointments(customerId, page, size);
        PageResponse<AppointmentResponse> response = PageResponse.from(appointments);
        return ResponseEntity.ok(ApiResponse.success(response, "Customer appointments retrieved successfully"));
    }

    @Operation(summary = "Update appointment status")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @PutMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        AppointmentResponse appointment = appointmentService.updateAppointmentStatus(id, request.getStatus());
        return ResponseEntity.ok(appointment);
    }
}
