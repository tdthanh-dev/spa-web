package com.htttql.crmmodule.common.config;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Centralized Rate Limiting Configuration
 * Thống nhất tất cả cấu hình rate limiting trong một nơi
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.rate-limit")
@Validated
public class RateLimitProperties {

    /**
     * Global rate limiting (cho tất cả APIs)
     */
    private Global global = new Global();

    /**
     * Lead-specific rate limiting (cho Lead creation API)
     */
    private Lead lead = new Lead();

    /**
     * Cache configuration cho rate limiting
     */
    private Cache cache = new Cache();

    @Data
    public static class Global {
        /**
         * Số request tối đa per minute (global)
         */
        @Min(1) @Max(10000)
        private int requestsPerMinute;

        /**
         * Window size in minutes
         */
        @Min(1) @Max(60)
        private int windowMinutes;

        /**
         * Enable/disable global rate limiting
         */
        private boolean enabled;
    }

    @Data
    public static class Lead {
        /**
         * Số lead tối đa per hour per IP
         */
        @Min(1) @Max(1000)
        private int maxPerHour;

        /**
         * Số lead tối đa per day per IP
         */
        @Min(1) @Max(10000)
        private int maxPerDay;

        /**
         * Window size for hourly limit (hours)
         */
        @Min(1) @Max(24)
        private int windowHours;

        /**
         * Window size for daily limit (hours)
         */
        @Min(1) @Max(720) // Max 30 days
        private int windowDays;

        /**
         * Enable/disable lead rate limiting
         */
        private boolean enabled;
    }

    @Data
    public static class Cache {
        /**
         * Redis key prefix cho global rate limiting
         */
        @NotBlank
        private String globalPrefix;

        /**
         * Redis key prefix cho lead rate limiting
         */
        @NotBlank
        private String leadPrefix;

        /**
         * Default TTL cho cache entries (hours)
         */
        @Min(1) @Max(8760) // Max 1 year
        private int defaultTtlHours;
    }

    /**
     * Utility methods
     */
    public String buildGlobalKey(String identifier) {
        return cache.getGlobalPrefix() + identifier;
    }

    public String buildLeadHourlyKey(String ipAddress) {
        return cache.getLeadPrefix() + "HOURLY:" + ipAddress;
    }

    public String buildLeadDailyKey(String ipAddress) {
        return cache.getLeadPrefix() + "DAILY:" + ipAddress;
    }
}