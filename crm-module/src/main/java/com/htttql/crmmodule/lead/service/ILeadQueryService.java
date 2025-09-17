package com.htttql.crmmodule.lead.service;

import com.htttql.crmmodule.common.enums.LeadStatus;
import com.htttql.crmmodule.lead.dto.LeadResponse;
import com.htttql.crmmodule.lead.dto.LeadStats;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Query operations for Lead (CQRS - Command Query Responsibility Segregation)
 * Read-only operations following Interface Segregation Principle
 */
public interface ILeadQueryService {

    Page<LeadResponse> getAllLeads(Pageable pageable);

    LeadResponse getLeadById(Long id);

    LeadStats getLeadStats();

    Page<LeadResponse> getLeadsByStatus(LeadStatus status, Pageable pageable);
}
