package com.htttql.crmmodule.billing.service;

import com.htttql.crmmodule.billing.dto.InvoiceRequest;
import com.htttql.crmmodule.billing.dto.InvoiceResponse;
import com.htttql.crmmodule.billing.dto.InvoiceStatusRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IInvoiceService {

    Page<InvoiceResponse> getAllInvoices(Pageable pageable);

    InvoiceResponse getInvoiceById(Long id);

    InvoiceResponse createInvoice(InvoiceRequest request);

    InvoiceResponse updateInvoice(Long id, InvoiceRequest request);

    void deleteInvoice(Long id);

    InvoiceResponse updateInvoiceStatus(Long id, InvoiceStatusRequest request);

    /**
     * Lấy danh sách hóa đơn theo ID khách hàng
     * @param customerId ID của khách hàng
     * @return Danh sách InvoiceResponse
     */
    List<InvoiceResponse> getInvoicesByCustomerId(Long customerId);
}
