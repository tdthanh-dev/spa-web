package com.htttql.crmmodule.billing.service;

import com.htttql.crmmodule.billing.dto.InvoiceRequest;
import com.htttql.crmmodule.billing.dto.InvoiceResponse;
import com.htttql.crmmodule.billing.dto.InvoiceStatusRequest;
import com.htttql.crmmodule.billing.entity.Invoice;
import com.htttql.crmmodule.billing.entity.Payment;
import com.htttql.crmmodule.billing.entity.PointTransaction;
import com.htttql.crmmodule.billing.repository.IInvoiceRepository;
import com.htttql.crmmodule.billing.repository.IPaymentRepository;
import com.htttql.crmmodule.billing.repository.IPointTransactionRepository;
import com.htttql.crmmodule.common.enums.InvoiceStatus;
import com.htttql.crmmodule.common.enums.PaidStatus;
import com.htttql.crmmodule.common.enums.PaymentMethod;
import com.htttql.crmmodule.common.enums.PointTransactionType;
import com.htttql.crmmodule.common.exception.BadRequestException;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.core.entity.Customer;
import com.htttql.crmmodule.core.entity.StaffUser;
import com.htttql.crmmodule.core.repository.ICustomerRepository;
import com.htttql.crmmodule.core.repository.IStaffUserRepository;
import com.htttql.crmmodule.core.service.ICustomerTierService;
import com.htttql.crmmodule.service.entity.CustomerCase;
import com.htttql.crmmodule.service.repository.ICustomerCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service("invoiceService")
@RequiredArgsConstructor
public class InvoiceServiceImpl implements IInvoiceService {

    private final IInvoiceRepository invoiceRepository;
    private final ICustomerRepository customerRepository;
    private final IStaffUserRepository staffUserRepository;
    private final IPointTransactionRepository pointTransactionRepository;
    private final IPaymentRepository paymentRepository;
    private final ICustomerTierService customerTierService;
    private final ICustomerCaseRepository customerCaseRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getAllInvoices(Pageable pageable) {
        Page<Invoice> invoices = invoiceRepository.findAll(pageable);
        return invoices.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
        return toResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        // Validate required fields
        if (request.getCustomerId() == null) {
            throw new BadRequestException("Customer ID is required");
        }
        if (request.getCaseId() == null) {
            throw new BadRequestException("Case ID is required");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        // Validate case if provided
        CustomerCase customerCase = null;
        if (request.getCaseId() != null) {
            customerCase = customerCaseRepository.findById(request.getCaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("CustomerCase", "id", request.getCaseId()));

            // Ensure case belongs to the customer
            if (!customerCase.getCustomer().getCustomerId().equals(request.getCustomerId())) {
                throw new BadRequestException("Case does not belong to the specified customer");
            }
        }

        String invoiceNumber = generateInvoiceNumber();

        // Validate user if provided
        StaffUser staffUser = null;
        if (request.getUserId() != null && !request.getUserId().toString().trim().isEmpty()) {
            staffUser = staffUserRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("StaffUser", "id", request.getUserId()));
        }

        // Determine total amount - from case if available, otherwise from request
        BigDecimal totalAmount;
        if (customerCase != null) {
            totalAmount = customerCase.getTotalAmount();
            if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
                // Fallback to request totalAmount if case amount is invalid
                if (request.getTotalAmount() != null && request.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
                    totalAmount = request.getTotalAmount();
                } else {
                    throw new BadRequestException("Customer case has invalid total amount and no valid amount provided in request");
                }
            }
        } else {
            if (request.getTotalAmount() == null || request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Total amount must be positive when not using customer case");
            }
            totalAmount = request.getTotalAmount();
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .customer(customer)
                .customerCase(customerCase)
                .staffUser(staffUser)
                .totalAmount(totalAmount)
                .status(request.getStatus() != null ? request.getStatus() : InvoiceStatus.DRAFT)
                .notes(request.getNotes())
                .dueDate(request.getDueDate())
                .build();

        invoice = invoiceRepository.save(invoice);

        // Create payment record if invoice is marked as PAID
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            createPaymentForPaidInvoice(invoice);
        }

        // Update case paid status if case is provided
        if (customerCase != null) {
            updateCasePaidStatus(customerCase);
        }

        // Note: Point awarding and tier refresh are handled in payment creation
        // to avoid duplicate points for PAID invoices

        return toResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse updateInvoice(Long id, InvoiceRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
            invoice.setCustomer(customer);
        }
        if (request.getTotalAmount() != null) {
            invoice.setTotalAmount(request.getTotalAmount());
        }
        if (request.getUserId() != null) {
            StaffUser staffUser = staffUserRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("StaffUser", "id", request.getUserId()));
            invoice.setStaffUser(staffUser);
        }
        if (request.getNotes() != null)
            invoice.setNotes(request.getNotes());
        if (request.getDueDate() != null)
            invoice.setDueDate(request.getDueDate());

        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));

        if (invoice.getStatus() != InvoiceStatus.DRAFT && invoice.getStatus() != InvoiceStatus.UNPAID) {
            throw new BadRequestException("Can only delete invoices with DRAFT or UNPAID status");
        }

        invoiceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public InvoiceResponse updateInvoiceStatus(Long id, InvoiceStatusRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));

        validateStatusTransition(invoice.getStatus(), request.getStatus());
        invoice.setStatus(request.getStatus());

        if (request.getStatus() == InvoiceStatus.PAID) {
            invoice.setPaidAt(LocalDateTime.now());
            // Update customer tier when invoice is marked as paid
            customerTierService.refreshCustomerTierInternal(invoice.getCustomer().getCustomerId());
        }

        if (request.getNotes() != null) {
            String existingNotes = invoice.getNotes() != null ? invoice.getNotes() + "\n" : "";
            invoice.setNotes(existingNotes + "[Status Update] " + request.getNotes());
        }

        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    private void validateStatusTransition(InvoiceStatus currentStatus, InvoiceStatus newStatus) {
        boolean isValid = switch (currentStatus) {
            case DRAFT -> newStatus == InvoiceStatus.UNPAID || newStatus == InvoiceStatus.VOID;
            case UNPAID -> newStatus == InvoiceStatus.PAID || newStatus == InvoiceStatus.VOID;
            case PAID -> newStatus == InvoiceStatus.VOID;
            case VOID -> false;
        };

        if (!isValid) {
            throw new BadRequestException(
                    String.format("Invalid status transition from %s to %s", currentStatus, newStatus));
        }
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .invoiceId(invoice.getInvoiceId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerId(invoice.getCustomer().getCustomerId())
                .customerName(invoice.getCustomer().getFullName())
                .caseId(invoice.getCustomerCase() != null ? invoice.getCustomerCase().getCaseId() : null)
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .notes(invoice.getNotes())
                .dueDate(invoice.getDueDate())
                .paidAt(invoice.getPaidAt())
                .userId(invoice.getStaffUser() != null ? invoice.getStaffUser().getStaffId() : null)
                .userName(invoice.getStaffUser() != null ? invoice.getStaffUser().getFullName() : null)
                .totalPaid(invoice.getTotalPaid())
                .balanceDue(invoice.getBalanceDue())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }

    private void awardPointsForInvoice(Customer customer, Invoice invoice) {
        try {
            if (invoice.getTotalAmount() == null || invoice.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return;
            }

            BigDecimal pointsPer10000VND = BigDecimal.valueOf(10000);
            BigDecimal pointsDecimal = invoice.getTotalAmount().divide(pointsPer10000VND, 0, RoundingMode.DOWN);
            int pointsToAward = pointsDecimal.intValue();

            if (pointsToAward > 0) {
                int currentPoints = customer.getTotalPoints() != null ? customer.getTotalPoints() : 0;
                int newPointsBalance = currentPoints + pointsToAward;

                // Create point transaction
                PointTransaction pointTransaction = PointTransaction.builder()
                        .customer(customer)
                        .source(PointTransactionType.EARN)
                        .points(pointsToAward)
                        .relatedInvoice(invoice)
                        .note(String.format("Earned %d points for invoice %s (%,.0f VND)",
                                pointsToAward, invoice.getInvoiceNumber(),
                                invoice.getTotalAmount().doubleValue()))
                        .balanceBefore(currentPoints)
                        .balanceAfter(newPointsBalance)
                        .build();

                pointTransactionRepository.save(pointTransaction);

                // Update customer points
                customer.setTotalPoints(newPointsBalance);
                customerRepository.save(customer);
            }
        } catch (Exception e) {
            // Don't fail the invoice creation if point awarding fails
        }
    }

    private void updateCasePaidStatus(CustomerCase customerCase) {
        try {
            // Calculate total amount and paid amount for the case
            BigDecimal totalAmount = invoiceRepository.getTotalAmountByCaseId(customerCase.getCaseId());
            BigDecimal paidAmount = invoiceRepository.getPaidAmountByCaseId(customerCase.getCaseId());

            PaidStatus newStatus;
            if (paidAmount.compareTo(BigDecimal.ZERO) == 0) {
                newStatus = PaidStatus.UNPAID;
            } else if (paidAmount.compareTo(totalAmount) < 0) {
                newStatus = PaidStatus.PARTIALLY_PAID;
            } else if (paidAmount.compareTo(totalAmount) == 0) {
                newStatus = PaidStatus.FULLY_PAID;
            } else {
                newStatus = PaidStatus.OVERPAID;
            }

            customerCase.setPaidStatus(newStatus);
            customerCaseRepository.save(customerCase);

            log.info("Updated case {} paid status to {}", customerCase.getCaseId(), newStatus);
        } catch (Exception e) {
            log.error("Failed to update case paid status for case {}", customerCase.getCaseId(), e);
            // Don't fail the invoice creation if case status update fails
        }
    }

    private void createPaymentForPaidInvoice(Invoice invoice) {
        try {
            Payment payment = Payment.builder()
                    .invoice(invoice)
                    .amount(invoice.getTotalAmount())
                    .method(PaymentMethod.CASH) // Default payment method
                    .note("Auto-generated payment for PAID invoice")
                    .paidBy(invoice.getStaffUser()) // Use the staff user from invoice
                    .paidAt(LocalDateTime.now())
                    .build();

            paymentRepository.save(payment);

            // Award points to customer for paid invoice
            awardPointsForInvoice(invoice.getCustomer(), invoice);

            // Update customer's total spent
            Customer customer = invoice.getCustomer();
            BigDecimal currentTotalSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : BigDecimal.ZERO;
            customer.setTotalSpent(currentTotalSpent.add(invoice.getTotalAmount()));
            customerRepository.save(customer);

            // Refresh customer tier after spending update
            customerTierService.refreshCustomerTierInternal(customer.getCustomerId());

            log.info("Created payment record for PAID invoice {}", invoice.getInvoiceId());
        } catch (Exception e) {
            log.error("Failed to create payment for invoice {}", invoice.getInvoiceId(), e);
            // Don't fail the invoice creation if payment creation fails
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByCustomerId(Long customerId) {
        // Validate customer exists
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        // Get all invoices for the customer
        List<Invoice> invoices = invoiceRepository.findByCustomer_CustomerId(customerId);

        // Convert to response DTOs
        return invoices.stream()
                .map(this::toResponse)
                .toList();
    }
}
