package com.htttql.crmmodule.service.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.service.service.IDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Dashboard Analytics", description = "Dashboard statistics and analytics endpoints")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final IDashboardService dashboardService;

    @Operation(summary = "Get receptionist dashboard counts")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/receptionist/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getReceptionistStats() {
        Map<String, Long> data = dashboardService.getReceptionistDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(data, "Receptionist dashboard counts"));
    }

    @Operation(summary = "Get appointment status counts")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/appointment-status")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getAppointmentStatusChart() {
        Map<String, Long> data = dashboardService.getAppointmentStatusChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Appointment status counts"));
    }

    @Operation(summary = "Get daily appointment trend (last 7 days)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/appointment-trend")
    public ResponseEntity<ApiResponse<List<Long>>> getAppointmentTrendChart() {
        List<Long> data = dashboardService.getAppointmentTrendChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Appointment trend counts (7 days)"));
    }

    @Operation(summary = "Get customer tier counts")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/customer-tiers")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCustomerTiersChart() {
        Map<String, Long> data = dashboardService.getCustomerTiersChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Customer tier counts"));
    }

    @Operation(summary = "Get revenue trend (last 30 days, VND)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/revenue-trend")
    public ResponseEntity<ApiResponse<List<Long>>> getRevenueTrendChart() {
        List<Long> data = dashboardService.getRevenueTrendChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Revenue trend numbers (30 days)"));
    }

    @Operation(summary = "Get monthly performance counts")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/performance/monthly")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getMonthlyPerformance() {
        Map<String, Long> data = dashboardService.getMonthlyPerformance();
        return ResponseEntity.ok(ApiResponse.success(data, "Monthly performance counts"));
    }
}
