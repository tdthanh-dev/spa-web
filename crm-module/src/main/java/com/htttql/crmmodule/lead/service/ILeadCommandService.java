package com.htttql.crmmodule.lead.service;

import com.htttql.crmmodule.lead.dto.LeadRequest;
import com.htttql.crmmodule.lead.dto.LeadResponse;
import com.htttql.crmmodule.lead.dto.LeadStatusRequest;

/**
 * Command operations for Lead (CQRS - Command Query Responsibility Segregation)
 * Write operations following Interface Segregation Principle
 */
public interface ILeadCommandService {

    LeadResponse createLead(LeadRequest request);

    LeadResponse updateLead(Long id, LeadRequest request);

    void deleteLead(Long id);

    LeadResponse updateLeadStatus(Long id, LeadStatusRequest request);
}
