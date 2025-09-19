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

        // Check if phone/IP is in cooldown period
        if (cacheService.get(phoneKey) != null) {
            throw new BadRequestException("Bạn vừa gửi yêu cầu với số điện thoại này. Vui lòng chờ ít nhất 10 giây trước khi gửi lại.");
        }

        if (cacheService.get(ipKey) != null) {
            throw new BadRequestException("Bạn vừa gửi yêu cầu từ địa chỉ IP này. Vui lòng chờ ít nhất 10 giây trước khi gửi tiếp.");
        }

        // Check daily IP request limit
        checkDailyIPLimit(ipAddress);
        
        // Check daily phone submission limit
        checkDailyPhoneLimit(phone);

        // Reserve temp data with cooldown
        Duration ttl = Duration.ofSeconds(properties.getAntiSpam().getIpBlockSeconds());
        cacheService.put(phoneKey, phone, ttl);
        cacheService.put(ipKey, ipAddress, ttl);

        // Increment daily counter
        incrementDailyIPCounter(ipAddress);
        incrementDailyPhoneCounter(phone);
    }

    private boolean checkDuplicateSubmission(String phone, String ipAddress) {
        String phoneKey = buildPhoneTempKey(phone);
        String ipKey = buildIpTempKey(ipAddress);

        return cacheService.get(phoneKey) != null || cacheService.get(ipKey) != null;
    }

    private void checkDailyIPLimit(String ipAddress) {
        String countKey = buildIpCountKey(ipAddress);
        String countStr = (String) cacheService.get(countKey);
        int currentCount = countStr != null ? Integer.parseInt(countStr) : 0;

        if (currentCount >= properties.getAntiSpam().getMaxRequestsPerDay()) {
            throw new BadRequestException(
                String.format("Bạn đã gửi quá nhiều yêu cầu hôm nay (%d/%d). Vui lòng thử lại vào ngày mai.", 
                    currentCount, properties.getAntiSpam().getMaxRequestsPerDay())
            );
        }
    }

    private void checkDailyPhoneLimit(String phone) {
        String countKey = buildPhoneCountKey(phone);
        String countStr = (String) cacheService.get(countKey);
        int currentCount = countStr != null ? Integer.parseInt(countStr) : 0;

        if (currentCount >= properties.getAntiSpam().getMaxSubmissionsPerPhone()) {
            throw new BadRequestException(
                String.format("Đã gửi yêu cầu với số điện thoại này hôm nay. Mỗi số điện thoại chỉ được gửi %d yêu cầu mỗi ngày. Vui lòng thử lại vào ngày mai.", 
                    properties.getAntiSpam().getMaxSubmissionsPerPhone())
            );
        }
    }

    private void incrementDailyIPCounter(String ipAddress) {
        String countKey = buildIpCountKey(ipAddress);
        String countStr = (String) cacheService.get(countKey);
        int currentCount = countStr != null ? Integer.parseInt(countStr) : 0;
        int newCount = currentCount + 1;

        // Set TTL to 24 hours for daily counter
        Duration dailyTtl = Duration.ofHours(24);
        cacheService.put(countKey, String.valueOf(newCount), dailyTtl);
    }

    private void incrementDailyPhoneCounter(String phone) {
        String countKey = buildPhoneCountKey(phone);
        String countStr = (String) cacheService.get(countKey);
        int currentCount = countStr != null ? Integer.parseInt(countStr) : 0;
        int newCount = currentCount + 1;

        // Set TTL to 24 hours for daily counter
        Duration dailyTtl = Duration.ofHours(24);
        cacheService.put(countKey, String.valueOf(newCount), dailyTtl);
    }

    private String buildPhoneTempKey(String phone) {
        return properties.getCache().getTempPrefix() + "PHONE:" + phone;
    }

    private String buildIpTempKey(String ipAddress) {
        return properties.getCache().getTempPrefix() + "IP:" + ipAddress;
    }

    private String buildIpCountKey(String ipAddress) {
        return properties.getCache().getTempPrefix() + "COUNT:" + ipAddress;
    }

    private String buildPhoneCountKey(String phone) {
        return properties.getCache().getTempPrefix() + "PHONE_COUNT:" + phone;
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
