package com.htttql.crmmodule.service.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.service.dto.*;
import com.htttql.crmmodule.service.service.IDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Dashboard Analytics", description = "Dashboard statistics and analytics endpoints")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final IDashboardService dashboardService;

    @Operation(summary = "Get receptionist dashboard statistics")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/receptionist/stats")
    public ResponseEntity<ApiResponse<ReceptionistDashboardStats>> getReceptionistStats() {
        ReceptionistDashboardStats stats = dashboardService.getReceptionistDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics retrieved successfully"));
    }

    @Operation(summary = "Get appointment status distribution for charts")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/appointment-status")
    public ResponseEntity<ApiResponse<List<ChartDataPoint>>> getAppointmentStatusChart() {
        List<ChartDataPoint> data = dashboardService.getAppointmentStatusChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Appointment status chart data retrieved successfully"));
    }

    @Operation(summary = "Get daily appointment trend for last 7 days")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/appointment-trend")
    public ResponseEntity<ApiResponse<List<ChartDataPoint>>> getAppointmentTrendChart() {
        List<ChartDataPoint> data = dashboardService.getAppointmentTrendChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Appointment trend chart data retrieved successfully"));
    }

    @Operation(summary = "Get service popularity chart")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/service-popularity")
    public ResponseEntity<ApiResponse<List<ChartDataPoint>>> getServicePopularityChart() {
        List<ChartDataPoint> data = dashboardService.getServicePopularityChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Service popularity chart data retrieved successfully"));
    }

    @Operation(summary = "Get customer tier distribution")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/customer-tiers")
    public ResponseEntity<ApiResponse<List<ChartDataPoint>>> getCustomerTiersChart() {
        List<ChartDataPoint> data = dashboardService.getCustomerTiersChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Customer tiers chart data retrieved successfully"));
    }

    @Operation(summary = "Get revenue trend for last 30 days")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/charts/revenue-trend")
    public ResponseEntity<ApiResponse<List<ChartDataPoint>>> getRevenueTrendChart() {
        List<ChartDataPoint> data = dashboardService.getRevenueTrendChart();
        return ResponseEntity.ok(ApiResponse.success(data, "Revenue trend chart data retrieved successfully"));
    }

    @Operation(summary = "Get monthly performance summary")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/performance/monthly")
    public ResponseEntity<ApiResponse<MonthlyPerformance>> getMonthlyPerformance() {
        MonthlyPerformance performance = dashboardService.getMonthlyPerformance();
        return ResponseEntity.ok(ApiResponse.success(performance, "Monthly performance data retrieved successfully"));
    }
}
