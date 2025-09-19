package com.htttql.crmmodule.lead.service.impl;

import com.htttql.crmmodule.common.exception.BadRequestException;
import com.htttql.crmmodule.common.service.CacheService;
import com.htttql.crmmodule.common.config.RateLimitProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Service for handling lead rate limiting
 */
@Service
@RequiredArgsConstructor
public class LeadRateLimitService {

    private final CacheService cacheService;
    private final RateLimitProperties rateLimitProperties;

    public void checkLimit(String ipAddress) {
        if (ipAddress == null || "unknown".equals(ipAddress)) {
            return;
        }

        if (!checkHourlyLimit(ipAddress)) {
            throw new BadRequestException(
                String.format("Bạn đã gửi quá nhiều yêu cầu trong giờ qua. Giới hạn tối đa %d yêu cầu mỗi giờ. Vui lòng thử lại sau.",
                    rateLimitProperties.getLead().getMaxPerHour()));
        }

        if (!checkDailyLimit(ipAddress)) {
            throw new BadRequestException(
                String.format("Bạn đã gửi quá nhiều yêu cầu hôm nay. Giới hạn tối đa %d yêu cầu mỗi ngày. Vui lòng thử lại vào ngày mai.",
                    rateLimitProperties.getLead().getMaxPerDay()));
        }
    }

    private boolean checkHourlyLimit(String ipAddress) {
        String hourlyKey = buildHourlyKey(ipAddress);
        Long currentCount = cacheService.increment(hourlyKey);

        if (currentCount == null) {
            return true;
        }

        if (currentCount == 1) {
            cacheService.expire(hourlyKey, Duration.ofHours(rateLimitProperties.getLead().getWindowHours()));
        }

        return currentCount <= rateLimitProperties.getLead().getMaxPerHour();
    }

    private boolean checkDailyLimit(String ipAddress) {
        String dailyKey = buildDailyKey(ipAddress);
        Long currentCount = cacheService.increment(dailyKey);

        if (currentCount == null) {
            return true;
        }

        if (currentCount == 1) {
            cacheService.expire(dailyKey, Duration.ofHours(rateLimitProperties.getLead().getWindowDays()));
        }

        return currentCount <= rateLimitProperties.getLead().getMaxPerDay();
    }

    private String buildHourlyKey(String ipAddress) {
        return rateLimitProperties.buildLeadHourlyKey(ipAddress);
    }

    private String buildDailyKey(String ipAddress) {
        return rateLimitProperties.buildLeadDailyKey(ipAddress);
    }

    public RateLimitStatus getStatus(String ipAddress) {
        String hourlyKey = buildHourlyKey(ipAddress);
        String dailyKey = buildDailyKey(ipAddress);

        String hourlyCount = cacheService.get(hourlyKey);
        String dailyCount = cacheService.get(dailyKey);

        return RateLimitStatus.builder()
                .ipAddress(ipAddress)
                .hourlyCount(hourlyCount != null ? Integer.parseInt(hourlyCount) : 0)
                .dailyCount(dailyCount != null ? Integer.parseInt(dailyCount) : 0)
                .hourlyLimit(rateLimitProperties.getLead().getMaxPerHour())
                .dailyLimit(rateLimitProperties.getLead().getMaxPerDay())
                .build();
    }

    public void resetLimits(String ipAddress) {
        String hourlyKey = buildHourlyKey(ipAddress);
        String dailyKey = buildDailyKey(ipAddress);

        cacheService.evict(hourlyKey);
        cacheService.evict(dailyKey);
    }

    @lombok.Data
    @lombok.Builder
    public static class RateLimitStatus {
        private String ipAddress;
        private int hourlyCount;
        private int dailyCount;
        private int hourlyLimit;
        private int dailyLimit;

        public boolean isHourlyExceeded() {
            return hourlyCount >= hourlyLimit;
        }

        public boolean isDailyExceeded() {
            return dailyCount >= dailyLimit;
        }
    }
}
