package com.htttql.crmmodule.core.service.impl;

import com.htttql.crmmodule.common.enums.PermissionLevel;
import com.htttql.crmmodule.common.enums.TierCode;
import com.htttql.crmmodule.common.exception.BadRequestException;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.common.factory.CustomerResponseFactory;
import com.htttql.crmmodule.core.dto.CustomerRequest;
import com.htttql.crmmodule.core.dto.CustomerResponse;
import com.htttql.crmmodule.core.dto.StaffFieldPermissions;
import com.htttql.crmmodule.core.entity.Customer;
import com.htttql.crmmodule.core.entity.Tier;
import com.htttql.crmmodule.core.repository.ICustomerRepository;
import com.htttql.crmmodule.core.repository.ITierRepository;
import com.htttql.crmmodule.core.service.ICustomerService;
import com.htttql.crmmodule.core.service.ICustomerTierService;
import com.htttql.crmmodule.core.service.IStaffFieldPermissionsService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("customerService")
public class CustomerServiceImpl implements ICustomerService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerServiceImpl.class);

    private final ICustomerRepository customerRepository;
    private final ITierRepository tierRepository;
    private final ICustomerTierService customerTierService;
    private final CustomerResponseFactory responseFactory;
    private final IStaffFieldPermissionsService staffFieldPermissionsService;

    public CustomerServiceImpl(ICustomerRepository customerRepository,
                              ITierRepository tierRepository,
                              ICustomerTierService customerTierService,
                              CustomerResponseFactory responseFactory,
                              IStaffFieldPermissionsService staffFieldPermissionsService) {
        this.customerRepository = customerRepository;
        this.tierRepository = tierRepository;
        this.customerTierService = customerTierService;
        this.responseFactory = responseFactory;
        this.staffFieldPermissionsService = staffFieldPermissionsService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable, Long staffId) {
        Page<Customer> customers = customerRepository.findAll(pageable);

        // Get staff permissions
        StaffFieldPermissions staffPermissions = null;
        try {
            staffPermissions = staffFieldPermissionsService.getByStaffId(staffId);
        } catch (Exception e) {
            // If permissions not found, return full data
            logger.debug("No permissions found for staff ID: {}, returning full data", staffId);
        }

        final StaffFieldPermissions finalPermissions = staffPermissions;
        return customers.map(customer -> toResponseWithPermissions(customer, finalPermissions));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id, Long staffId) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        // Get staff permissions
        StaffFieldPermissions staffPermissions = null;
        try {
            staffPermissions = staffFieldPermissionsService.getByStaffId(staffId);
        } catch (Exception e) {
            // If permissions not found, return full data
            logger.debug("No permissions found for staff ID: {}, returning full data", staffId);
        }

        return toResponseWithPermissions(customer, staffPermissions);
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

    private CustomerResponse toResponseWithPermissions(Customer customer, StaffFieldPermissions permissions) {
        CustomerResponse response = responseFactory.createFullResponse(customer);

        // Apply field-level permissions if permissions exist
        if (permissions != null) {
            applyFieldMasking(response, permissions);
        }

        return response;
    }

    private void applyFieldMasking(CustomerResponse response, StaffFieldPermissions permissions) {
        // Apply masking only when permission is explicitly NO
        // VIEW and EDIT permissions show full data
        // null permissions show full data

        // Mask customer name based on permission
        if (permissions.getCustomerName() == PermissionLevel.NO) {
            response.setFullName(maskName(response.getFullName()));
        }

        // Mask phone based on permission
        if (permissions.getCustomerPhone() == PermissionLevel.NO) {
            response.setPhone(maskPhone(response.getPhone()));
        }

        // Mask email based on permission
        if (permissions.getCustomerEmail() == PermissionLevel.NO) {
            response.setEmail(maskEmail(response.getEmail()));
        }

        // Mask DOB based on permission
        if (permissions.getCustomerDob() == PermissionLevel.NO) {
            response.setDob(null);
        }

        // Mask address based on permission
        if (permissions.getCustomerAddress() == PermissionLevel.NO) {
            response.setDisplayAddress(maskAddress(response.getDisplayAddress()));
        }

        // Mask notes based on permission
        if (permissions.getCustomerNotes() == PermissionLevel.NO) {
            response.setNotes(maskText(response.getNotes()));
        }

        // Financial data - only show if VIEW or EDIT permission
        if (permissions.getCustomerTotalSpent() == PermissionLevel.NO) {
            response.setTotalSpent(null);
        }

        if (permissions.getCustomerTotalPoints() == PermissionLevel.NO) {
            response.setTotalPoints(null);
        }

        // Tier and VIP status - mask if no permission
        if (permissions.getCustomerTier() == PermissionLevel.NO) {
            response.setTierCode(null);
            response.setTierName(null);
        }

        if (permissions.getCustomerVipStatus() == PermissionLevel.NO) {
            response.setIsVip(null);
        }
    }

    private CustomerResponse toResponse(Customer customer) {
        return responseFactory.createBasicResponse(customer);
    }

    // Helper methods for masking sensitive data
    private String maskName(String name) {
        if (name == null || name.length() <= 2) return "***";
        return name.charAt(0) + "***" + name.charAt(name.length() - 1);
    }

    private String maskPhone(String phone) {
        if (phone == null) return "***";
        String cleanPhone = phone.replaceAll("\\D", "");
        if (cleanPhone.length() <= 4) return "***";
        return cleanPhone.substring(0, 3) + "***" + cleanPhone.substring(cleanPhone.length() - 2);
    }

    private String maskEmail(String email) {
        if (email == null) return "***";
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) return "***";
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (localPart.length() <= 2) return "***" + domain;
        return localPart.charAt(0) + "***" + domain;
    }

    private String maskAddress(String address) {
        if (address == null || address.length() <= 10) return "***";
        return address.substring(0, 5) + "***" + address.substring(address.length() - 5);
    }

    private String maskText(String text) {
        if (text == null || text.length() <= 5) return "***";
        return text.substring(0, 3) + "***";
    }
}
