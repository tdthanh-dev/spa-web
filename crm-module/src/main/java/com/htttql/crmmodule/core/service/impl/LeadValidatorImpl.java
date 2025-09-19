package com.htttql.crmmodule.core.service.impl;

import com.htttql.crmmodule.core.repository.ICustomerRepository;
import com.htttql.crmmodule.lead.dto.LeadRequest;
import com.htttql.crmmodule.lead.service.ILeadValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Implementation of ILeadValidator that provides access to customer data
 * Placed in core module to maintain proper dependency direction
 */
@Service
@RequiredArgsConstructor
public class LeadValidatorImpl implements ILeadValidator {

    private final ICustomerRepository customerRepository;

    @Override
    public boolean isExistingCustomer(String phone) {
        return customerRepository.findByPhone(phone).isPresent();
    }

    @Override
    public Long getCustomerIdByPhone(String phone) {
        return customerRepository.findByPhone(phone)
                .map(customer -> customer.getCustomerId())
                .orElse(null);
    }

    @Override
    public boolean isValidLeadRequest(LeadRequest request) {
        if (request == null) {
            return false;
        }

        // Basic validation - can be extended
        return request.getFullName() != null && !request.getFullName().trim().isEmpty() &&
               request.getPhone() != null && !request.getPhone().trim().isEmpty();
    }
}
