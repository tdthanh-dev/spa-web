package com.htttql.crmmodule.core.service;

import com.htttql.crmmodule.common.enums.TierCode;
import com.htttql.crmmodule.common.exception.BadRequestException;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.common.factory.CustomerResponseFactory;
import com.htttql.crmmodule.core.dto.CustomerRequest;
import com.htttql.crmmodule.core.dto.CustomerResponse;
import com.htttql.crmmodule.core.dto.StaffPermissionSummaryDTO;
import com.htttql.crmmodule.core.entity.Customer;
import com.htttql.crmmodule.core.entity.Tier;
import com.htttql.crmmodule.core.repository.ICustomerRepository;
import com.htttql.crmmodule.core.repository.ITierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service("customerService")
@RequiredArgsConstructor
public class CustomerServiceImpl implements ICustomerService {

    private final ICustomerRepository customerRepository;
    private final ITierRepository tierRepository;
    private final ICustomerTierService customerTierService;
    private final CustomerResponseFactory responseFactory;
    private final IPermissionService permissionService;

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        Page<Customer> customers = customerRepository.findAll(pageable);
        return customers.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return toResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already exists");
        }
        if (request.getEmail() != null && customerRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Tier defaultTier = tierRepository.findByCode(TierCode.REGULAR)
                .orElseThrow(() -> new BadRequestException("Default tier not found"));

        Customer customer = Customer.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .dob(request.getDob())
                .gender(request.getGender())
                .address(request.getAddress())
                .notes(request.getNotes())
                .isVip(request.getIsVip())
                .tier(defaultTier)
                .build();

        customer = customerRepository.save(customer);
        return toResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (request.getPhone() != null && !request.getPhone().equals(customer.getPhone())) {
            if (customerRepository.existsByPhone(request.getPhone())) {
                throw new BadRequestException("Phone number already exists");
            }
        }
        if (request.getEmail() != null && !request.getEmail().equals(customer.getEmail())) {
            if (customerRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
        }

        if (request.getFullName() != null)
            customer.setFullName(request.getFullName());
        if (request.getPhone() != null)
            customer.setPhone(request.getPhone());
        if (request.getEmail() != null)
            customer.setEmail(request.getEmail());
        if (request.getDob() != null)
            customer.setDob(request.getDob());
        if (request.getGender() != null)
            customer.setGender(request.getGender());
        if (request.getAddress() != null)
            customer.setAddress(request.getAddress());
        if (request.getNotes() != null)
            customer.setNotes(request.getNotes());
        if (request.getIsVip() != null)
            customer.setIsVip(request.getIsVip());

        customer = customerRepository.save(customer);
        return toResponse(customer);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", "id", id);
        }
        customerRepository.deleteById(id);
    }

    /**
     * Manually refresh customer tier
     */
    @Override
    @Transactional
    public CustomerResponse refreshCustomerTier(Long customerId) {
        return customerTierService.refreshCustomerTier(customerId);
    }

    /**
     * Batch refresh all customers' tiers
     */
    @Override
    @Transactional
    public void refreshAllCustomerTiers() {
        customerTierService.refreshAllCustomerTiers();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse applyFieldLevelPermissions(CustomerResponse customer, Long staffId, Long customerId) {
        // Check permissions for each field and mask/nullify if not allowed

        // Basic information fields
        if (!permissionService.canReadCustomerName(staffId, customerId)) {
            customer.setFullName("***"); // Mask name
        }

        if (!permissionService.canReadCustomerPhone(staffId, customerId)) {
            customer.setPhone("***"); // Mask phone
        }

        if (!permissionService.canReadCustomerEmail(staffId, customerId)) {
            customer.setEmail("***"); // Mask email
        }

        if (!permissionService.canReadCustomerAddress(staffId, customerId)) {
            customer.setDisplayAddress("***"); // Mask address
        }

        if (!permissionService.canReadCustomerDOB(staffId, customerId)) {
            customer.setDob(null); // Hide DOB
        }

        if (!permissionService.canReadCustomerNotes(staffId, customerId)) {
            customer.setNotes("***"); // Mask notes
        }

        // Financial information (more sensitive)
        if (!permissionService.canViewCustomerFinancial(staffId, customerId)) {
            customer.setTotalSpent(null); // Hide spending
            customer.setTotalPoints(null); // Hide points
        }

        // Tier and VIP status
        if (!permissionService.canViewCustomerFinancial(staffId, customerId)) {
            customer.setTierCode(null); // Hide tier code
            customer.setTierName(null); // Hide tier name
            customer.setIsVip(null); // Hide VIP status
        }

        return customer;
    }

    @Override
    @Transactional(readOnly = true)
    public void validateUpdatePermissions(CustomerRequest request, Long staffId, Long customerId) {
        // Check if staff can update the fields they're trying to modify

        if (request.getFullName() != null && !permissionService.canWriteCustomerName(staffId, customerId)) {
            throw new SecurityException("No permission to update customer name");
        }

        if (request.getPhone() != null && !permissionService.canWriteCustomerPhone(staffId, customerId)) {
            throw new SecurityException("No permission to update customer phone");
        }

        if (request.getEmail() != null && !permissionService.canWriteCustomerEmail(staffId, customerId)) {
            throw new SecurityException("No permission to update customer email");
        }

        if (request.getAddress() != null && !permissionService.canWriteCustomerAddress(staffId, customerId)) {
            throw new SecurityException("No permission to update customer address");
        }

        if (request.getDob() != null && !permissionService.canWriteCustomerDOB(staffId, customerId)) {
            throw new SecurityException("No permission to update customer date of birth");
        }

        if (request.getNotes() != null && !permissionService.canWriteCustomerNotes(staffId, customerId)) {
            throw new SecurityException("No permission to update customer notes");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public StaffPermissionSummaryDTO createStaffPermissionSummary(Long staffId, Long customerId) {
        // Delegate to permission service
        return permissionService.createStaffPermissionSummary(staffId, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Boolean> createFieldPermissionMap(Long staffId, String fieldName, Long customerId) {
        boolean canRead = permissionService.canReadCustomerField(staffId, fieldName, customerId);
        boolean canWrite = permissionService.canWriteCustomerField(staffId, fieldName, customerId);

        java.util.Map<String, Boolean> result = new java.util.HashMap<>();
        result.put("canRead", canRead);
        result.put("canWrite", canWrite);
        result.put("hasAnyPermission", canRead || canWrite);

        return result;
    }

    private CustomerResponse toResponse(Customer customer) {
        return responseFactory.createBasicResponse(customer);
    }
}
