package com.htttql.crmmodule.audit.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
import com.htttql.crmmodule.audit.dto.AuditLogResponse;
import com.htttql.crmmodule.audit.dto.TaskRequest;
import com.htttql.crmmodule.audit.dto.TaskResponse;
import com.htttql.crmmodule.audit.dto.RetouchScheduleRequest;
import com.htttql.crmmodule.audit.dto.RetouchScheduleResponse;
import com.htttql.crmmodule.common.dto.StatusUpdateRequest;
import com.htttql.crmmodule.audit.service.IAuditService;
import com.htttql.crmmodule.audit.service.ITaskService;
import com.htttql.crmmodule.audit.service.IRetouchScheduleService;
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
 * Audit Management Controller
 * Manages audit logs, tasks, and retouch schedules
 */
@Tag(name = "Audit Management", description = "Audit logs, tasks, and retouch schedules management")
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final IAuditService auditService;
    private final ITaskService taskService;
    private final IRetouchScheduleService retouchScheduleService;

    // ==================== AUDIT LOGS ====================

    @Operation(summary = "Get all audit logs with pagination")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getAllAuditLogs(Pageable pageable) {
        Page<AuditLogResponse> logs = auditService.getAllAuditLogs(pageable);
        PageResponse<AuditLogResponse> response = PageResponse.from(logs);
        return ResponseEntity.ok(ApiResponse.success(response, "Audit logs retrieved successfully"));
    }

    @Operation(summary = "Get audit log by ID")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/logs/{id}")
    public ResponseEntity<ApiResponse<AuditLogResponse>> getAuditLogById(@PathVariable Long id) {
        AuditLogResponse log = auditService.getAuditLogById(id);
        return ResponseEntity.ok(ApiResponse.success(log, "Audit log retrieved successfully"));
    }

    // ==================== TASKS ====================

    @Operation(summary = "Get all tasks with pagination")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<PageResponse<TaskResponse>>> getAllTasks(Pageable pageable) {
        Page<TaskResponse> tasks = taskService.getAllTasks(pageable);
        PageResponse<TaskResponse> response = PageResponse.from(tasks);
        return ResponseEntity.ok(ApiResponse.success(response, "Tasks retrieved successfully"));
    }

    @Operation(summary = "Create new task")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(task, "Task created successfully"));
    }

    @Operation(summary = "Update task")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse task = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.success(task, "Task updated successfully"));
    }

    @Operation(summary = "Delete task")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }

    @Operation(summary = "Update task status")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        TaskResponse task = taskService.updateTaskStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(task, "Task status updated successfully"));
    }

    // ==================== RETOUCH SCHEDULES ====================

    @Operation(summary = "Get all retouch schedules with pagination")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @GetMapping("/retouch-schedules")
    public ResponseEntity<ApiResponse<PageResponse<RetouchScheduleResponse>>> getAllRetouchSchedules(Pageable pageable) {
        Page<RetouchScheduleResponse> schedules = retouchScheduleService.getAllRetouchSchedules(pageable);
        PageResponse<RetouchScheduleResponse> response = PageResponse.from(schedules);
        return ResponseEntity.ok(ApiResponse.success(response, "Retouch schedules retrieved successfully"));
    }

    @Operation(summary = "Create new retouch schedule")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @PostMapping("/retouch-schedules")
    public ResponseEntity<ApiResponse<RetouchScheduleResponse>> createRetouchSchedule(
            @Valid @RequestBody RetouchScheduleRequest request) {
        RetouchScheduleResponse schedule = retouchScheduleService.createRetouchSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(schedule, "Retouch schedule created successfully"));
    }

    @Operation(summary = "Update retouch schedule")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @PutMapping("/retouch-schedules/{id}")
    public ResponseEntity<ApiResponse<RetouchScheduleResponse>> updateRetouchSchedule(
            @PathVariable Long id,
            @Valid @RequestBody RetouchScheduleRequest request) {
        RetouchScheduleResponse schedule = retouchScheduleService.updateRetouchSchedule(id, request);
        return ResponseEntity.ok(ApiResponse.success(schedule, "Retouch schedule updated successfully"));
    }

    @Operation(summary = "Delete retouch schedule")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/retouch-schedules/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRetouchSchedule(@PathVariable Long id) {
        retouchScheduleService.deleteRetouchSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Retouch schedule deleted successfully"));
    }

    @Operation(summary = "Update retouch schedule status")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @PutMapping("/retouch-schedules/{id}/status")
    public ResponseEntity<ApiResponse<RetouchScheduleResponse>> updateRetouchScheduleStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        RetouchScheduleResponse schedule = retouchScheduleService.updateRetouchScheduleStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(schedule, "Retouch schedule status updated successfully"));
    }
}
