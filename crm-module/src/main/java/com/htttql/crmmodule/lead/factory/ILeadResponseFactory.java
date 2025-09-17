package com.htttql.crmmodule.lead.factory;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.dto.PageResponse;
import com.htttql.crmmodule.lead.dto.LeadResponse;
import com.htttql.crmmodule.lead.dto.LeadStats;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

/**
 * Interface for Lead Response Factory
 * Follows Interface Segregation Principle
 */
public interface ILeadResponseFactory {
    
    ResponseEntity<ApiResponse<LeadResponse>> success(LeadResponse data, String message);
    
    ResponseEntity<ApiResponse<LeadResponse>> created(LeadResponse data, String message);
    
    ResponseEntity<ApiResponse<Void>> success(String message);
    
    ResponseEntity<ApiResponse<PageResponse<LeadResponse>>> success(Page<LeadResponse> page, String message);
    
    ResponseEntity<ApiResponse<LeadStats>> success(LeadStats data, String message);
}
