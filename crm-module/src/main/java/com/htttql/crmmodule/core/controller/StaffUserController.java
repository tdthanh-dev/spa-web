package com.htttql.crmmodule.core.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
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
    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StaffUserResponse>>> getAllStaffUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "staffId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<StaffUserResponse> staffUsers = staffUserService.getAllStaffUsers(pageable);
        PageResponse<StaffUserResponse> response = PageResponse.from(staffUsers);
        return ResponseEntity.ok(ApiResponse.success(response, "Staff users retrieved successfully"));
    }

    @Operation(summary = "Get staff user by ID")
    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffUserResponse>> getStaffUserById(@PathVariable Long id) {
        StaffUserResponse staffUser = staffUserService.getStaffUserById(id);
        return ResponseEntity.ok(ApiResponse.success(staffUser, "Staff user retrieved successfully"));
    }

    @Operation(summary = "Create new staff user")
    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<StaffUserResponse>> createStaffUser(
            @Valid @RequestBody StaffUserRequest request) {
        StaffUserResponse staffUser = staffUserService.createStaffUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(staffUser, "Staff user created successfully"));
    }

    @Operation(summary = "Update staff user")
    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffUserResponse>> updateStaffUser(
            @PathVariable Long id,
            @Valid @RequestBody StaffUserRequest request) {
        StaffUserResponse staffUser = staffUserService.updateStaffUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(staffUser, "Staff user updated successfully"));
    }

    @Operation(summary = "Delete staff user")
    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStaffUser(@PathVariable Long id) {
        staffUserService.deleteStaffUser(id);
        return ResponseEntity.ok(ApiResponse.success("Staff user deleted successfully"));
    }

    @Operation(summary = "Update staff user status")
    @PreAuthorize("hasRole('MANAGER')")
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
