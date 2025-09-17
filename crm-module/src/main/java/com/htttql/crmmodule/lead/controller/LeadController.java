package com.htttql.crmmodule.lead.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
import com.htttql.crmmodule.common.enums.LeadStatus;
import com.htttql.crmmodule.lead.dto.LeadRequest;
import com.htttql.crmmodule.lead.dto.LeadResponse;
import com.htttql.crmmodule.lead.dto.LeadStatusRequest;
import com.htttql.crmmodule.lead.dto.LeadStats;
import com.htttql.crmmodule.lead.factory.ILeadResponseFactory;
import com.htttql.crmmodule.lead.service.ILeadQueryService;
import com.htttql.crmmodule.lead.service.ILeadCommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Lead Management", description = "Lead CRUD operations")
@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@Validated
public class LeadController {

    private final ILeadQueryService queryService;
    private final ILeadCommandService commandService;
    
    @Qualifier("leadApiResponseFactory")
    private final ILeadResponseFactory responseFactory;

    @Operation(summary = "Get all leads with pagination")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<LeadResponse>>> getAllLeads(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "leadId") @Pattern(regexp = "^(leadId|fullName|phone|createdAt|status)$") String sortBy,
            @RequestParam(defaultValue = "desc") @Pattern(regexp = "^(asc|desc)$", flags = Pattern.Flag.CASE_INSENSITIVE) String sortDir) {

        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<LeadResponse> leads = queryService.getAllLeads(pageable);
        return responseFactory.success(leads, "Leads retrieved successfully");
    }

    @Operation(summary = "Get lead by ID")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadResponse>> getLeadById(@PathVariable Long id) {
        LeadResponse lead = queryService.getLeadById(id);
        return responseFactory.success(lead, "Lead retrieved successfully");
    }

    @Operation(summary = "Create new lead (Public API - No authentication required)")
    @PostMapping
    public ResponseEntity<ApiResponse<LeadResponse>> createLead(@Valid @RequestBody LeadRequest request) {
        LeadResponse lead = commandService.createLead(request);
        return responseFactory.created(lead, "Lead created successfully");
    }

    @Operation(summary = "Update lead")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadResponse>> updateLead(
            @PathVariable Long id,
            @Valid @RequestBody LeadRequest request) {
        LeadResponse lead = commandService.updateLead(id, request);
        return responseFactory.success(lead, "Lead updated successfully");
    }

    @Operation(summary = "Delete lead")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable Long id) {
        commandService.deleteLead(id);
        return responseFactory.success("Lead deleted successfully");
    }

    @Operation(summary = "Update lead status")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<LeadResponse>> updateLeadStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeadStatusRequest request) {
        LeadResponse lead = commandService.updateLeadStatus(id, request);
        return responseFactory.success(lead, "Lead status updated successfully");
    }

    @Operation(summary = "Get lead statistics")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<LeadStats>> getLeadStats() {
        LeadStats stats = queryService.getLeadStats();
        return responseFactory.success(stats, "Lead statistics retrieved successfully");
    }

    @Operation(summary = "Get leads by status")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST')")
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<PageResponse<LeadResponse>>> getLeadsByStatus(
            @PathVariable LeadStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "leadId") @Pattern(regexp = "^(leadId|fullName|phone|createdAt|status)$") String sortBy,
            @RequestParam(defaultValue = "desc") @Pattern(regexp = "^(asc|desc)$", flags = Pattern.Flag.CASE_INSENSITIVE) String sortDir) {

        Pageable pageable = createPageable(page, size, sortBy, sortDir);
        Page<LeadResponse> leads = queryService.getLeadsByStatus(status, pageable);
        return responseFactory.success(leads, "Leads retrieved successfully");
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
            Sort.by(sortBy).descending() :
            Sort.by(sortBy).ascending();
        return PageRequest.of(page, size, sort);
    }
}