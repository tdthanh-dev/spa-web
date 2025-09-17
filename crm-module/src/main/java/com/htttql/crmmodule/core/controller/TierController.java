package com.htttql.crmmodule.core.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
import com.htttql.crmmodule.core.dto.TierRequest;
import com.htttql.crmmodule.core.dto.TierResponse;
import com.htttql.crmmodule.core.service.ITierService;
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
 * Tier Management Controller
 * Manages customer loyalty tiers and benefits
 */
@Tag(name = "Tier Management", description = "Customer loyalty tiers and benefits management")
@RestController
@RequestMapping("/api/tiers")
@RequiredArgsConstructor
public class TierController {

    private final ITierService tierService;

    @Operation(summary = "Get all tiers with pagination")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TierResponse>>> getAllTiers(Pageable pageable) {
        Page<TierResponse> tiers = tierService.getAllTiers(pageable);
        PageResponse<TierResponse> response = PageResponse.from(tiers);
        return ResponseEntity.ok(ApiResponse.success(response, "Tiers retrieved successfully"));
    }

    @Operation(summary = "Get tier by ID")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TierResponse>> getTierById(@PathVariable Long id) {
        TierResponse tier = tierService.getTierById(id);
        return ResponseEntity.ok(ApiResponse.success(tier, "Tier retrieved successfully"));
    }

    @Operation(summary = "Create new tier")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<TierResponse>> createTier(@Valid @RequestBody TierRequest request) {
        TierResponse tier = tierService.createTier(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tier, "Tier created successfully"));
    }

    @Operation(summary = "Update tier")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TierResponse>> updateTier(
            @PathVariable Long id,
            @Valid @RequestBody TierRequest request) {
        TierResponse tier = tierService.updateTier(id, request);
        return ResponseEntity.ok(ApiResponse.success(tier, "Tier updated successfully"));
    }

    @Operation(summary = "Delete tier")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTier(@PathVariable Long id) {
        tierService.deleteTier(id);
        return ResponseEntity.ok(ApiResponse.success("Tier deleted successfully"));
    }
}
