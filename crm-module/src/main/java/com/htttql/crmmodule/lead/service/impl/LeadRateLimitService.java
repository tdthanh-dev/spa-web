package com.htttql.crmmodule.lead.service.impl;

import com.htttql.crmmodule.common.exception.BadRequestException;
import com.htttql.crmmodule.common.service.CacheService;
import com.htttql.crmmodule.lead.config.LeadProperties;
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
    private final LeadProperties properties;

    public void checkLimit(String ipAddress) {
        if (ipAddress == null || "unknown".equals(ipAddress)) {
            return;
        }

        if (!checkHourlyLimit(ipAddress)) {
            throw new BadRequestException(
                String.format("Hourly rate limit exceeded for IP: %s. Maximum %d leads per hour.",
                    ipAddress, properties.getRateLimit().getMaxPerHour()));
        }

        if (!checkDailyLimit(ipAddress)) {
            throw new BadRequestException(
                String.format("Daily rate limit exceeded for IP: %s. Maximum %d leads per day.",
                    ipAddress, properties.getRateLimit().getMaxPerDay()));
        }
    }

    private boolean checkHourlyLimit(String ipAddress) {
        String hourlyKey = buildHourlyKey(ipAddress);
        Long currentCount = cacheService.increment(hourlyKey);

        if (currentCount == null) {
            return true;
        }

        if (currentCount == 1) {
            cacheService.expire(hourlyKey, Duration.ofHours(properties.getRateLimit().getWindowHours()));
        }

        return currentCount <= properties.getRateLimit().getMaxPerHour();
    }

    private boolean checkDailyLimit(String ipAddress) {
        String dailyKey = buildDailyKey(ipAddress);
        Long currentCount = cacheService.increment(dailyKey);

        if (currentCount == null) {
            return true;
        }

        if (currentCount == 1) {
            cacheService.expire(dailyKey, Duration.ofHours(properties.getRateLimit().getWindowDays()));
        }

        return currentCount <= properties.getRateLimit().getMaxPerDay();
    }

    private String buildHourlyKey(String ipAddress) {
        return properties.getCache().getRateLimitPrefix() + "HOURLY:" + ipAddress;
    }

    private String buildDailyKey(String ipAddress) {
        return properties.getCache().getRateLimitPrefix() + "DAILY:" + ipAddress;
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
                .hourlyLimit(properties.getRateLimit().getMaxPerHour())
                .dailyLimit(properties.getRateLimit().getMaxPerDay())
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
