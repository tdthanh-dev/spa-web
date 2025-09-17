package com.htttql.crmmodule.lead.service.impl;

import com.htttql.crmmodule.common.enums.LeadStatus;
import com.htttql.crmmodule.lead.dto.LeadRequest;
import com.htttql.crmmodule.lead.dto.LeadResponse;
import com.htttql.crmmodule.lead.dto.LeadStats;
import com.htttql.crmmodule.lead.dto.LeadStatusRequest;
import com.htttql.crmmodule.lead.service.ILeadCommandService;
import com.htttql.crmmodule.lead.service.ILeadQueryService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service implementation for lead management following CQRS pattern
 * Thin layer that delegates to LeadCoordinatorService
 * Reduced from 7 dependencies to 1 for better maintainability
 */
@Service("leadService")
@RequiredArgsConstructor
public class LeadServiceImpl implements ILeadQueryService, ILeadCommandService {

    private final LeadCoordinatorService coordinatorService;

    @Override
    public Page<LeadResponse> getAllLeads(Pageable pageable) {
        return coordinatorService.getAllLeads(pageable);
    }

    @Override
    public LeadResponse getLeadById(Long id) {
        return coordinatorService.getLeadById(id);
    }

    @Override
    public LeadStats getLeadStats() {
        return coordinatorService.getLeadStats();
    }

    @Override
    public Page<LeadResponse> getLeadsByStatus(LeadStatus status, Pageable pageable) {
        return coordinatorService.getLeadsByStatus(status, pageable);
    }

    @Override
    public LeadResponse createLead(LeadRequest request) {
        return coordinatorService.createLead(request);
    }

    @Override
    public LeadResponse updateLead(Long id, LeadRequest request) {
        return coordinatorService.updateLead(id, request);
    }

    @Override
    public void deleteLead(Long id) {
        coordinatorService.deleteLead(id);
    }

    @Override
    public LeadResponse updateLeadStatus(Long id, LeadStatusRequest request) {
        return coordinatorService.updateLeadStatus(id, request);
    }
}
