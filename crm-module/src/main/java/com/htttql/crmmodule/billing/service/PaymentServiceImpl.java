package com.htttql.crmmodule.billing.service;

import com.htttql.crmmodule.billing.dto.PaymentRequest;
import com.htttql.crmmodule.billing.dto.PaymentResponse;
import com.htttql.crmmodule.billing.entity.Payment;
import com.htttql.crmmodule.billing.entity.Invoice;
import com.htttql.crmmodule.billing.entity.PointTransaction;
import com.htttql.crmmodule.billing.repository.IPaymentRepository;
import com.htttql.crmmodule.billing.repository.IInvoiceRepository;
import com.htttql.crmmodule.billing.repository.IPointTransactionRepository;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.common.enums.PointTransactionType;
import com.htttql.crmmodule.core.entity.Customer;
import com.htttql.crmmodule.core.entity.Tier;
import com.htttql.crmmodule.core.repository.ICustomerRepository;
import com.htttql.crmmodule.core.repository.ITierRepository;
import com.htttql.crmmodule.core.service.ICustomerTierService;
import com.htttql.crmmodule.common.enums.TierCode;
import com.htttql.crmmodule.common.enums.PaidStatus;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements IPaymentService {

    private final IPaymentRepository paymentRepository;
    private final IInvoiceRepository invoiceRepository;
    private final ICustomerRepository customerRepository;
    private final ITierRepository tierRepository;
    private final ICustomerCaseRepository customerCaseRepository;
    private final ICustomerTierService customerTierService;
    private final IPointTransactionRepository pointTransactionRepository;

    @Override
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(this::mapToResponse);
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return mapToResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        // Fetch and validate invoice
        var invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Invoice not found with id: " + request.getInvoiceId()));

        // Validate payment amount doesn't exceed invoice total
        BigDecimal totalPaid = invoice.getTotalPaid();
        BigDecimal remainingAmount = invoice.getTotalAmount().subtract(totalPaid);
        if (request.getAmount().compareTo(remainingAmount) > 0) {
            throw new IllegalArgumentException("Payment amount exceeds remaining invoice amount: " + remainingAmount);
        }

        // Create payment linked to invoice
        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .method(request.getMethod())
                .txnRef(request.getTransactionId())
                .paidAt(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Award points for this payment (based on payment amount, not invoice total)
        awardPointsForPayment(invoice.getCustomer(), request.getAmount(), invoice);

        // Update customer's total spent
        Customer customer = invoice.getCustomer();
        BigDecimal currentTotalSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : BigDecimal.ZERO;
        customer.setTotalSpent(currentTotalSpent.add(request.getAmount()));
        customerRepository.save(customer);

        updateCustomerTierAfterPayment(customer, request.getAmount());

        // Update case paid status if invoice has a case
        if (invoice.getCustomerCase() != null) {
            updateCasePaidStatus(invoice.getCustomerCase());
        }

        return mapToResponse(savedPayment);
    }

    @Override
    public PaymentResponse updatePayment(Long id, PaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setTxnRef(request.getTransactionId());

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToResponse(updatedPayment);
    }

    @Override
    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Payment not found with id: " + id);
        }
        paymentRepository.deleteById(id);
    }

    @Override
    public PaymentResponse updatePaymentStatus(Long id, String status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        if ("COMPLETED".equals(status)) {
            payment.setPaidAt(LocalDateTime.now());
        }

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToResponse(updatedPayment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .invoiceId(payment.getInvoice() != null ? payment.getInvoice().getInvoiceId() : null)
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .txnRef(payment.getTxnRef())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    private void updateCustomerTierAfterPayment(Customer customer, BigDecimal paymentAmount) {
        try {
            customerTierService.refreshCustomerTierInternal(customer.getCustomerId());
        } catch (Exception e) {
            // Log error but don't fail payment creation
            log.error("Failed to refresh customer tier for customer {}: {}", customer.getCustomerId(), e.getMessage());
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
            // Don't fail the payment if case status update fails
        }
    }

    private void awardPointsForPayment(Customer customer, BigDecimal paymentAmount, Invoice invoice) {
        try {
            if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
                return;
            }

            BigDecimal pointsPer10000VND = BigDecimal.valueOf(10000);
            BigDecimal pointsDecimal = paymentAmount.divide(pointsPer10000VND, 0, RoundingMode.DOWN);
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
                        .note(String.format("Earned %d points for payment %,.0f VND on invoice %s",
                                pointsToAward, paymentAmount.doubleValue(), 
                                invoice.getInvoiceNumber()))
                        .balanceBefore(currentPoints)
                        .balanceAfter(newPointsBalance)
                        .build();

                pointTransactionRepository.save(pointTransaction);

                // Update customer points
                customer.setTotalPoints(newPointsBalance);
                customerRepository.save(customer);

                log.info("Awarded {} points to customer {} for payment of {} VND", 
                    pointsToAward, customer.getCustomerId(), paymentAmount);
            }
        } catch (Exception e) {
            log.error("Failed to award points for payment: {}", e.getMessage());
            // Don't fail the payment creation if point awarding fails
        }
    }
}
