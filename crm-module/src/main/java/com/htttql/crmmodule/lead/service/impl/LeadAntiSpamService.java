package com.htttql.crmmodule.lead.service.impl;

import com.htttql.crmmodule.common.exception.BadRequestException;
import com.htttql.crmmodule.common.service.CacheService;
import com.htttql.crmmodule.common.service.RequestContextService;
import com.htttql.crmmodule.lead.config.LeadProperties;
import com.htttql.crmmodule.lead.dto.LeadRequest;
import com.htttql.crmmodule.lead.service.ILeadValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Service for anti-spam validation and duplicate prevention
 */
@Service
@RequiredArgsConstructor
public class LeadAntiSpamService {

    private final ILeadValidator leadValidator;
    private final CacheService cacheService;
    private final RequestContextService requestContextService;
    private final LeadProperties properties;

    public ValidationResult validate(LeadRequest request) {
        if (!properties.getAntiSpam().isEnabled()) {
            return ValidationResult.builder()
                    .valid(true)
                    .existingCustomerId(null)
                    .build();
        }

        RequestContextService.RequestContext context = requestContextService.getCurrentContext();
        Long existingCustomerId = leadValidator.getCustomerIdByPhone(request.getPhone());
        boolean isDuplicate = checkDuplicateSubmission(request.getPhone(), context.getIpAddress());

        return ValidationResult.builder()
                .valid(!isDuplicate)
                .existingCustomerId(existingCustomerId)
                .duplicateDetected(isDuplicate)
                .build();
    }

    public ValidationResult validateAndReserve(LeadRequest request, RequestContextService.RequestContext context) {
        if (!properties.getAntiSpam().isEnabled()) {
            Long existingCustomerId = leadValidator.getCustomerIdByPhone(request.getPhone());
            return ValidationResult.builder()
                    .valid(true)
                    .existingCustomerId(existingCustomerId)
                    .build();
        }

        checkAndReserveTempData(request.getPhone(), context.getIpAddress());
        Long existingCustomerId = leadValidator.getCustomerIdByPhone(request.getPhone());

        return ValidationResult.builder()
                .valid(true)
                .existingCustomerId(existingCustomerId)
                .build();
    }

    private void checkAndReserveTempData(String phone, String ipAddress) {
        String phoneKey = buildPhoneTempKey(phone);
        String ipKey = buildIpTempKey(ipAddress);

        if (cacheService.get(phoneKey) != null) {
            throw new BadRequestException("Duplicate submission detected for this phone number. Please try again later.");
        }

        if (cacheService.get(ipKey) != null) {
            throw new BadRequestException("Too many submissions from your IP address. Please try again later.");
        }

        Duration ttl = Duration.ofHours(properties.getCache().getTempStorageTtlHours());
        cacheService.put(phoneKey, phone, ttl);
        cacheService.put(ipKey, ipAddress, ttl);
    }

    private boolean checkDuplicateSubmission(String phone, String ipAddress) {
        String phoneKey = buildPhoneTempKey(phone);
        String ipKey = buildIpTempKey(ipAddress);

        return cacheService.get(phoneKey) != null || cacheService.get(ipKey) != null;
    }

    private String buildPhoneTempKey(String phone) {
        return properties.getCache().getTempPrefix() + "PHONE:" + phone;
    }

    private String buildIpTempKey(String ipAddress) {
        return properties.getCache().getTempPrefix() + "IP:" + ipAddress;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return phone;
        }
        return phone.substring(0, 3) + "***" + phone.substring(phone.length() - 3);
    }

    public void clearTempData(String phone) {
        String phoneKey = buildPhoneTempKey(phone);
        cacheService.evict(phoneKey);
    }

    @lombok.Data
    @lombok.Builder
    public static class ValidationResult {
        private boolean valid;
        private Long existingCustomerId;
        private boolean duplicateDetected;

        public boolean hasExistingCustomer() {
            return existingCustomerId != null;
        }

        public String getReason() {
            if (duplicateDetected) {
                return "Duplicate submission detected";
            }
            return "Valid";
        }
    }
}
