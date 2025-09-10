package com.htttql.crmmodule.core.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.core.dto.StaffUserRequest;
import com.htttql.crmmodule.core.dto.StaffUserResponse;
import com.htttql.crmmodule.core.dto.StaffUserStatusRequest;
import com.htttql.crmmodule.core.service.IStaffUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Staff User Management", description = "Staff User CRUD operations")
@RestController
@RequestMapping("/api/staff-users")
@RequiredArgsConstructor
public class StaffUserController {

    private final IStaffUserService staffUserService;

    @Operation(summary = "Get all staff users with pagination")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<StaffUserResponse>>> getAllStaffUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "staffId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<StaffUserResponse> staffUsers = staffUserService.getAllStaffUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(staffUsers, "Staff users retrieved successfully"));
    }

    @Operation(summary = "Get staff user by ID")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffUserResponse>> getStaffUserById(@PathVariable Long id) {
        StaffUserResponse staffUser = staffUserService.getStaffUserById(id);
        return ResponseEntity.ok(ApiResponse.success(staffUser, "Staff user retrieved successfully"));
    }

    @Operation(summary = "Create new staff user")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<StaffUserResponse>> createStaffUser(
            @Valid @RequestBody StaffUserRequest request) {
        StaffUserResponse staffUser = staffUserService.createStaffUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(staffUser, "Staff user created successfully"));
    }

    @Operation(summary = "Update staff user")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffUserResponse>> updateStaffUser(
            @PathVariable Long id,
            @Valid @RequestBody StaffUserRequest request) {
        StaffUserResponse staffUser = staffUserService.updateStaffUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(staffUser, "Staff user updated successfully"));
    }

    @Operation(summary = "Delete staff user")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStaffUser(@PathVariable Long id) {
        staffUserService.deleteStaffUser(id);
        return ResponseEntity.ok(ApiResponse.success("Staff user deleted successfully"));
    }

    @Operation(summary = "Update staff user status")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StaffUserResponse>> updateStaffUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody StaffUserStatusRequest request) {
        StaffUserResponse staffUser = staffUserService.updateStaffUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(staffUser, "Staff user status updated successfully"));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("OK", "Service is healthy"));
    }

}
