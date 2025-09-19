package com.htttql.crmmodule.lead.config;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for Lead module
 * Rate limiting đã được chuyển sang RateLimitProperties
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.lead")
@Validated
public class LeadProperties {

    private Cache cache = new Cache();
    private AntiSpam antiSpam = new AntiSpam();
    private Stats stats = new Stats();

    @Data
    public static class Cache {
        @Min(1) @Max(8760) // Max 1 year
        private int ttlHours;

        @Min(1) @Max(8760)
        private int tempStorageTtlHours;

        @NotBlank
        private String prefix;

        @NotBlank
        private String allPrefix;

        @NotBlank
        private String statusPrefix;

        @NotBlank
        private String tempPrefix;

        @NotBlank
        private String statsPrefix;
    }

    @Data
    public static class AntiSpam {
        private boolean enabled;

        @Min(1) @Max(2592000) // Max 30 days in seconds
        private int uniqueConstraintSeconds;

        @Min(1) @Max(2592000) // Max 30 days in seconds
        private int ipBlockSeconds;
        
        @Min(1) @Max(1000) // Max 1000 requests per day
        private int maxRequestsPerDay;
        
        @Min(1) @Max(100) // Max submissions per phone per day
        private int maxSubmissionsPerPhone;
    }

    @Data
    public static class Stats {
        @Min(1) @Max(24)
        private int refreshIntervalHours;

        private boolean autoUpdate;
    }
}
