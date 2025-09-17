package com.htttql.crmmodule.service.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
import com.htttql.crmmodule.service.dto.CustomerCaseRequest;
import com.htttql.crmmodule.service.dto.CustomerCaseResponse;
import com.htttql.crmmodule.service.service.ICustomerCaseService;
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
 * Customer Case Management Controller
 * Manages customer service cases and treatments
 */
@Tag(name = "Customer Case Management", description = "Customer service cases and treatment management")
@RestController
@RequestMapping("/api/customer-cases")
@RequiredArgsConstructor
public class CustomerCaseController {

    private final ICustomerCaseService customerCaseService;

    @Operation(summary = "Get customer cases by customer ID")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'RECEPTIONIST')")
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<PageResponse<CustomerCaseResponse>>> getCustomerCasesByCustomerId(
            @PathVariable Long customerId,
            Pageable pageable) {
        Page<CustomerCaseResponse> cases = customerCaseService.getCustomerCasesByCustomerId(customerId, pageable);
        PageResponse<CustomerCaseResponse> response = PageResponse.from(cases);
        return ResponseEntity.ok(ApiResponse.success(response, "Customer cases retrieved successfully"));
    }

    @Operation(summary = "Get customer case by ID")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'RECEPTIONIST')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerCaseResponse>> getCustomerCaseById(@PathVariable Long id) {
        CustomerCaseResponse customerCase = customerCaseService.getCustomerCaseById(id);
        return ResponseEntity.ok(ApiResponse.success(customerCase, "Customer case retrieved successfully"));
    }

    @Operation(summary = "Create new customer case")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerCaseResponse>> createCustomerCase(
            @Valid @RequestBody CustomerCaseRequest request) {
        CustomerCaseResponse customerCase = customerCaseService.createCustomerCase(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(customerCase, "Customer case created successfully"));
    }

    @Operation(summary = "Update customer case")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'TECHNICIAN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerCaseResponse>> updateCustomerCase(
            @PathVariable Long id,
            @Valid @RequestBody CustomerCaseRequest request) {
        CustomerCaseResponse customerCase = customerCaseService.updateCustomerCase(id, request);
        return ResponseEntity.ok(ApiResponse.success(customerCase, "Customer case updated successfully"));
    }

    @Operation(summary = "Delete customer case")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomerCase(@PathVariable Long id) {
        customerCaseService.deleteCustomerCase(id);
        return ResponseEntity.ok(ApiResponse.success("Customer case deleted successfully"));
    }

    @Operation(summary = "Update customer case status")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'TECHNICIAN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CustomerCaseResponse>> updateCustomerCaseStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        CustomerCaseResponse customerCase = customerCaseService.updateCustomerCaseStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(customerCase, "Customer case status updated successfully"));
    }
}
