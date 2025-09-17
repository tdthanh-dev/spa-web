package com.htttql.crmmodule.billing.dto;

import com.htttql.crmmodule.common.enums.InvoiceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    private Long customerId;

    @NotNull(message = "Case ID is required")
    private Long caseId;

    private Long userId;

    private BigDecimal totalAmount;

    private InvoiceStatus status;
    private String notes;
    private LocalDateTime dueDate;
}
