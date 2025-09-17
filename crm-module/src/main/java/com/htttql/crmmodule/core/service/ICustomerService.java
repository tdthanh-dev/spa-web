package com.htttql.crmmodule.core.service;

import com.htttql.crmmodule.core.dto.CustomerRequest;
import com.htttql.crmmodule.core.dto.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICustomerService {

    Page<CustomerResponse> getAllCustomers(Pageable pageable, Long staffId);

    CustomerResponse getCustomerById(Long id, Long staffId);

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse updateCustomer(Long id, CustomerRequest request);

    void deleteCustomer(Long id);

    CustomerResponse refreshCustomerTier(Long customerId);

    void refreshAllCustomerTiers();
}
