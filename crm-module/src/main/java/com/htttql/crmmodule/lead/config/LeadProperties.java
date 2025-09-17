package com.htttql.crmmodule.lead.config;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for Lead module
 * Replaces magic numbers and hard-coded values
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.lead")
@Validated
public class LeadProperties {

    private RateLimit rateLimit = new RateLimit();
    private Cache cache = new Cache();
    private AntiSpam antiSpam = new AntiSpam();
    private Stats stats = new Stats();

    @Data
    public static class RateLimit {
        @Min(1) @Max(10000)
        private int maxPerHour = 1000;

        @Min(10) @Max(100000)
        private int maxPerDay = 10000;

        @Min(1) @Max(24)
        private int windowHours = 1;

        @Min(1) @Max(720) // Max 30 days
        private int windowDays = 24;
    }

    @Data
    public static class Cache {
        @Min(1) @Max(8760) // Max 1 year
        private int ttlHours = 24;

        @Min(1) @Max(8760)
        private int tempStorageTtlHours = 48;

        @NotBlank
        private String prefix = "LEAD:";

        @NotBlank
        private String allPrefix = "ALL:";

        @NotBlank
        private String statusPrefix = "STATUS:";

        @NotBlank
        private String rateLimitPrefix = "RATE_LIMIT:";

        @NotBlank
        private String tempPrefix = "TEMP:";

        @NotBlank
        private String statsPrefix = "STATS:";
    }

    @Data
    public static class AntiSpam {
        private boolean enabled = true;

        @Min(1) @Max(720) // Max 30 days
        private int uniqueConstraintHours = 24;

        @Min(1) @Max(720)
        private int ipBlockHours = 24;
    }

    @Data
    public static class Stats {
        @Min(1) @Max(24)
        private int refreshIntervalHours = 1;

        private boolean autoUpdate = true;
    }
}
