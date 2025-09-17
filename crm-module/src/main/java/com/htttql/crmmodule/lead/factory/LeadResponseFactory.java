package com.htttql.crmmodule.lead.factory;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
import com.htttql.crmmodule.common.enums.LeadStatus;
import com.htttql.crmmodule.lead.dto.LeadResponse;
import com.htttql.crmmodule.lead.dto.LeadStats;
import com.htttql.crmmodule.lead.entity.Lead;
import com.htttql.crmmodule.lead.service.impl.LeadDisplayService;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * Factory for standardized Lead API responses
 * Follows Single Responsibility Principle - only success responses
 */
@Component("leadApiResponseFactory")
@Primary
@RequiredArgsConstructor
public class LeadResponseFactory implements ILeadResponseFactory {

    private final LeadDisplayService displayService;

    public ResponseEntity<ApiResponse<LeadResponse>> success(LeadResponse data, String message) {
        return ResponseEntity.ok(ApiResponse.<LeadResponse>builder()
                .success(true)
                .data(data)
                .message(message)
                .build());
    }

    public ResponseEntity<ApiResponse<LeadResponse>> created(LeadResponse data, String message) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<LeadResponse>builder()
                        .success(true)
                        .data(data)
                        .message(message)
                        .build());
    }

    public ResponseEntity<ApiResponse<Void>> success(String message) {
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .build());
    }

    public ResponseEntity<ApiResponse<PageResponse<LeadResponse>>> success(Page<LeadResponse> page, String message) {
        PageResponse<LeadResponse> response = PageResponse.from(page);
        return ResponseEntity.ok(ApiResponse.<PageResponse<LeadResponse>>builder()
                .success(true)
                .data(response)
                .message(message)
                .build());
    }

    public ResponseEntity<ApiResponse<LeadStats>> success(LeadStats data, String message) {
        return ResponseEntity.ok(ApiResponse.<LeadStats>builder()
                .success(true)
                .data(data)
                .message(message)
                .build());
    }

    public LeadResponse createLeadResponse(Lead lead) {
        LeadResponse response = new LeadResponse();
        response.setLeadId(lead.getLeadId());
        response.setFullName(lead.getFullName());
        response.setPhone(lead.getPhone());
        response.setNote(lead.getNote());
        response.setStatus(lead.getStatus());
        response.setCustomerId(lead.getCustomerId());
        response.setIsExistingCustomer(lead.getIsExistingCustomer());
        response.setCreatedAt(lead.getCreatedAt());

        return response;
    }

    public String getDisplayStatus(LeadStatus status) {
        return displayService.getDisplayStatus(status);
    }
}
