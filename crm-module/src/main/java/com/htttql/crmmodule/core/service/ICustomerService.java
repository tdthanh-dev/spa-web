package com.htttql.crmmodule.core.service;

import com.htttql.crmmodule.core.dto.CustomerRequest;
import com.htttql.crmmodule.core.dto.CustomerResponse;
import com.htttql.crmmodule.core.dto.StaffPermissionSummaryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICustomerService {

    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    CustomerResponse getCustomerById(Long id);

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse updateCustomer(Long id, CustomerRequest request);

    void deleteCustomer(Long id);

    CustomerResponse refreshCustomerTier(Long customerId);

    void refreshAllCustomerTiers();

    // Field-level permission methods
    CustomerResponse applyFieldLevelPermissions(CustomerResponse customer, Long staffId, Long customerId);

    void validateUpdatePermissions(CustomerRequest request, Long staffId, Long customerId);

    // Permission checking methods
    StaffPermissionSummaryDTO createStaffPermissionSummary(Long staffId, Long customerId);

    java.util.Map<String, Boolean> createFieldPermissionMap(Long staffId, String fieldName, Long customerId);
}
