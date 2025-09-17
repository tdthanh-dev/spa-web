package com.htttql.crmmodule.core.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
import com.htttql.crmmodule.core.dto.CustomerRequest;
import com.htttql.crmmodule.core.dto.CustomerResponse;
import com.htttql.crmmodule.core.service.ICustomerService;
import com.htttql.crmmodule.security.service.SecurityContextService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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

@Tag(name = "Customer Management", description = "Customer CRUD operations")
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final ICustomerService customerService;
    private final SecurityContextService securityContextService;

    @Operation(summary = "Get all customers with pagination")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CustomerResponse>>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "customerId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Long staffId = null;
        try {
            staffId = securityContextService.getCurrentStaffId();
        } catch (Exception ignored) {
        }

        Page<CustomerResponse> customers = customerService.getAllCustomers(pageable, staffId);
        PageResponse<CustomerResponse> response = PageResponse.from(customers);
        return ResponseEntity.ok(ApiResponse.success(response, "Customers retrieved successfully"));
    }

    @Operation(summary = "Get customer by ID")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        Long staffId = null;
        try {
            staffId = securityContextService.getCurrentStaffId();
        } catch (Exception ignored) {
        }

        CustomerResponse customer = customerService.getCustomerById(id, staffId);
        return ResponseEntity.ok(ApiResponse.success(customer, "Customer retrieved successfully"));
    }

    @Operation(summary = "Create new customer")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse customer = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(customer, "Customer created successfully"));
    }

    @Operation(summary = "Update customer")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse customer = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.success(customer, "Customer updated successfully"));
    }

    @Operation(summary = "Delete customer")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted successfully"));
    }

    @Operation(summary = "Refresh customer tier based on current spending and points")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @PostMapping("/{id}/refresh-tier")
    public ResponseEntity<ApiResponse<CustomerResponse>> refreshCustomerTier(@PathVariable Long id) {
        CustomerResponse customer = customerService.refreshCustomerTier(id);
        return ResponseEntity.ok(ApiResponse.success(customer, "Customer tier refreshed successfully"));
    }

    @Operation(summary = "Batch refresh all customers' tiers")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/refresh-all-tiers")
    public ResponseEntity<ApiResponse<Void>> refreshAllCustomerTiers() {
        customerService.refreshAllCustomerTiers();
        return ResponseEntity.ok(ApiResponse.success("All customer tiers refreshed successfully"));
    }
}
