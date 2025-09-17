package com.htttql.crmmodule.service.service;

import com.htttql.crmmodule.service.dto.CustomerCaseRequest;
import com.htttql.crmmodule.service.dto.CustomerCaseResponse;
import com.htttql.crmmodule.service.entity.CustomerCase;
import com.htttql.crmmodule.service.entity.CaseService;
import com.htttql.crmmodule.service.entity.SpaService;
import com.htttql.crmmodule.common.enums.CaseStatus;
import com.htttql.crmmodule.common.enums.CaseServiceStatus;
import com.htttql.crmmodule.common.enums.PaidStatus;
import com.htttql.crmmodule.core.entity.Customer;
import com.htttql.crmmodule.service.repository.ICustomerCaseRepository;
import com.htttql.crmmodule.service.repository.IServiceRepository;
import com.htttql.crmmodule.core.repository.ICustomerRepository;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CustomerCaseServiceImpl implements ICustomerCaseService {

    private final ICustomerCaseRepository customerCaseRepository;
    private final ICustomerRepository customerRepository;
    private final IServiceRepository serviceRepository;

    @Override
    public Page<CustomerCaseResponse> getAllCustomerCases(Pageable pageable) {
        Page<CustomerCase> cases = customerCaseRepository.findAll(pageable);
        return cases.map(this::mapToResponse);
    }

    @Override
    public CustomerCaseResponse getCustomerCaseById(Long id) {
        CustomerCase customerCase = customerCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer case not found with id: " + id));
        return mapToResponse(customerCase);
    }

    @Override
    public Page<CustomerCaseResponse> getCustomerCasesByCustomerId(Long customerId, Pageable pageable) {
        List<CustomerCase> allCases = customerCaseRepository.findByCustomer_CustomerId(customerId);

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allCases.size());

        List<CustomerCase> pageContent = allCases.subList(start, end);

        return new org.springframework.data.domain.PageImpl<>(
                pageContent,
                pageable,
                allCases.size()).map(this::mapToResponse);
    }

    @Override
    public CustomerCaseResponse updateCustomerCaseStatus(Long id, String status) {
        CustomerCase customerCase = customerCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer case not found with id: " + id));

        CaseStatus caseStatus;
        try {
            caseStatus = CaseStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            // Handle legacy status values
            if ("COMPLETED".equals(status.toUpperCase())) {
                caseStatus = CaseStatus.DONE;
            } else {
                throw e;
            }
        }
        customerCase.setStatus(caseStatus);

        CustomerCase updatedCase = customerCaseRepository.save(customerCase);
        return mapToResponse(updatedCase);
    }

    @Override
    public CustomerCaseResponse createCustomerCase(CustomerCaseRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        SpaService service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        // Convert CaseServiceStatus to CaseStatus
        CaseStatus caseStatus;
        try {
            caseStatus = CaseStatus.valueOf(request.getStatus().name());
        } catch (IllegalArgumentException e) {
            // Handle legacy status values
            if ("COMPLETED".equals(request.getStatus().name())) {
                caseStatus = CaseStatus.DONE;
            } else {
                throw e;
            }
        }

        CustomerCase customerCase = CustomerCase.builder()
                .customer(customer)
                .primaryService(service)
                .status(caseStatus)
                .paidStatus(PaidStatus.UNPAID) // Set default paid status
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .intakeNote(request.getNotes())
                .build();

        // Create initial CaseService for the primary service
        CaseService caseService = CaseService.builder()
                .service(service)
                .unitPrice(service.getBasePrice())
                .qty(1)
                .discountAmount(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .status(CaseServiceStatus.PLANNED)
                .build();

        // Add the case service to the customer case (this will update totalAmount)
        customerCase.addCaseService(caseService);

        CustomerCase savedCase = customerCaseRepository.save(customerCase);
        return mapToResponse(savedCase);
    }

    @Override
    public CustomerCaseResponse updateCustomerCase(Long id, CustomerCaseRequest request) {
        CustomerCase customerCase = customerCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer case not found with id: " + id));

        // Fetch related entities if IDs are provided
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer not found with id: " + request.getCustomerId()));
            customerCase.setCustomer(customer);
        }

        if (request.getServiceId() != null) {
            SpaService service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Service not found with id: " + request.getServiceId()));
            customerCase.setPrimaryService(service);
        }

        // Update other fields
        if (request.getStatus() != null) {
            CaseStatus caseStatus;
            try {
                caseStatus = CaseStatus.valueOf(request.getStatus().name());
            } catch (IllegalArgumentException e) {
                // Handle legacy status values
                if ("COMPLETED".equals(request.getStatus().name())) {
                    caseStatus = CaseStatus.DONE;
                } else {
                    throw e;
                }
            }
            customerCase.setStatus(caseStatus);
        }

        if (request.getStartDate() != null) {
            customerCase.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            customerCase.setEndDate(request.getEndDate());
        }

        customerCase.setIntakeNote(request.getNotes());

        CustomerCase updatedCase = customerCaseRepository.save(customerCase);
        return mapToResponse(updatedCase);
    }

    @Override
    public void deleteCustomerCase(Long id) {
        if (!customerCaseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer case not found with id: " + id);
        }
        customerCaseRepository.deleteById(id);
    }

    private CustomerCaseResponse mapToResponse(CustomerCase customerCase) {
        return CustomerCaseResponse.builder()
                .caseId(customerCase.getCaseId())
                .customerId(customerCase.getCustomer() != null ? customerCase.getCustomer().getCustomerId() : null)
                .customerName(customerCase.getCustomer() != null ? customerCase.getCustomer().getFullName() : null)
                .primaryServiceId(
                        customerCase.getPrimaryService() != null ? customerCase.getPrimaryService().getServiceId()
                                : null)
                .primaryServiceName(
                        customerCase.getPrimaryService() != null ? customerCase.getPrimaryService().getName() : null)
                .status(customerCase.getStatus())
                .paidStatus(customerCase.getPaidStatus() != null ? customerCase.getPaidStatus() : PaidStatus.UNPAID)
                .startDate(customerCase.getStartDate())
                .endDate(customerCase.getEndDate())
                .intakeNote(customerCase.getIntakeNote())
                .totalAmount(customerCase.getTotalAmount())
                .createdAt(customerCase.getCreatedAt())
                .updatedAt(customerCase.getUpdatedAt())
                .build();
    }
}
