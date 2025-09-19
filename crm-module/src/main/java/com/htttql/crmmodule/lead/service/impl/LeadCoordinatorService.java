package com.htttql.crmmodule.lead.service.impl;

import com.htttql.crmmodule.common.enums.LeadStatus;
import com.htttql.crmmodule.common.service.CacheService;
import com.htttql.crmmodule.common.service.RequestContextService;
import com.htttql.crmmodule.lead.config.LeadProperties;
import com.htttql.crmmodule.lead.dto.LeadRequest;
import com.htttql.crmmodule.lead.dto.LeadResponse;
import com.htttql.crmmodule.lead.dto.LeadStats;
import com.htttql.crmmodule.lead.dto.LeadStatusRequest;
import com.htttql.crmmodule.lead.entity.Lead;
import com.htttql.crmmodule.lead.repository.ILeadRepository;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

/**
 * Coordinator service for lead operations
 * Orchestrates specialized services following Single Responsibility Principle
 */
@Service
@RequiredArgsConstructor
public class LeadCoordinatorService {

    private final ILeadRepository leadRepository;
    private final ModelMapper modelMapper;
    private final CacheService cacheService;
    private final LeadProperties properties;
    private final RequestContextService requestContextService;

    // Specialized services
    private final LeadRateLimitService rateLimitService;
    private final LeadAntiSpamService antiSpamService;
    private final LeadStatisticsService statisticsService;

    @Transactional(readOnly = true)
    public Page<LeadResponse> getAllLeads(Pageable pageable) {
        Page<Lead> leads = leadRepository.findAll(pageable);
        return leads.map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(Long id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new com.htttql.crmmodule.lead.exception.LeadNotFoundException(id));
        return convertToResponse(lead);
    }

    @Transactional(readOnly = true)
    public LeadStats getLeadStats() {
        return statisticsService.getLeadStats();
    }

    @Transactional(readOnly = true)
    public Page<LeadResponse> getLeadsByStatus(LeadStatus status, Pageable pageable) {
        Page<Lead> leads = leadRepository.findByStatus  (status, pageable);
        return leads.map(this::convertToResponse);
    }

    @Transactional
    public LeadResponse createLead(LeadRequest request) {
        // Get request context
        RequestContextService.RequestContext context = requestContextService.getCurrentContext();

        // Rate limiting
        rateLimitService.checkLimit(context.getIpAddress());

        // Anti-spam validation
        LeadAntiSpamService.ValidationResult validation = antiSpamService.validateAndReserve(request, context);

        // Create lead
        Lead lead = Lead.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .note(request.getNote())
                .ipAddress(context.getIpAddress())
                .userAgent(context.getUserAgent())
                .isExistingCustomer(validation.hasExistingCustomer())
                .build();

        if (validation.hasExistingCustomer()) {
            lead.setCustomerId(validation.getExistingCustomerId());
        }

        Lead savedLead = leadRepository.save(lead);

        // Update statistics
        statisticsService.incrementStats();

        // Clean up temp data
        antiSpamService.clearTempData(request.getPhone());

        return convertToResponse(savedLead);
    }

    @Transactional
    public LeadResponse updateLead(Long id, LeadRequest request) {
        Lead existingLead = leadRepository.findById(id)
                .orElseThrow(() -> new com.htttql.crmmodule.lead.exception.LeadNotFoundException(id));

        existingLead.setFullName(request.getFullName());
        existingLead.setPhone(request.getPhone());
        existingLead.setNote(request.getNote());

        Lead updatedLead = leadRepository.save(existingLead);

        // Invalidate cache
        evictLeadCache(id);

        return convertToResponse(updatedLead);
    }

    @Transactional
    public void deleteLead(Long id) {
        if (!leadRepository.existsById(id)) {
            throw new com.htttql.crmmodule.lead.exception.LeadNotFoundException(id);
        }
        leadRepository.deleteById(id);
        evictLeadCache(id);
    }

    @Transactional
    public LeadResponse updateLeadStatus(Long id, LeadStatusRequest request) {
        Lead existingLead = leadRepository.findById(id)
                .orElseThrow(() -> new com.htttql.crmmodule.lead.exception.LeadNotFoundException(id));

        existingLead.setStatus(request.getStatus());
        Lead updatedLead = leadRepository.save(existingLead);

        evictLeadCache(id);
        return convertToResponse(updatedLead);
    }

    private LeadResponse convertToResponse(Lead lead) {
        LeadResponse response = modelMapper.map(lead, LeadResponse.class);
        return response;
    }

    private void evictLeadCache(Long leadId) {
        String key = properties.getCache().getPrefix() + leadId;
        cacheService.evict(key);
    }
}
