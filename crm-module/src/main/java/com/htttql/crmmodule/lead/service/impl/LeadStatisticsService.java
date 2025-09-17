package com.htttql.crmmodule.lead.service.impl;

import com.htttql.crmmodule.common.service.CacheService;
import com.htttql.crmmodule.lead.config.LeadProperties;
import com.htttql.crmmodule.lead.dto.LeadStats;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service for managing lead statistics
 */
@Service
@RequiredArgsConstructor
public class LeadStatisticsService {

    private final CacheService cacheService;
    private final LeadProperties properties;

    public LeadStats getLeadStats() {
        try {
            String todayKey = buildTodayKey();
            String totalKey = buildTotalKey();

            String todayCount = cacheService.get(todayKey);
            String totalCount = cacheService.get(totalKey);

            return LeadStats.builder()
                    .todayCount(todayCount != null ? Integer.parseInt(todayCount) : 0)
                    .totalCount(totalCount != null ? Integer.parseInt(totalCount) : 0)
                    .lastUpdated(LocalDateTime.now().toString())
                    .build();
        } catch (Exception e) {
            return createEmptyStats();
        }
    }

    public void incrementStats() {
        if (!properties.getStats().isAutoUpdate()) {
            return;
        }

        try {
            String todayKey = buildTodayKey();
            String totalKey = buildTotalKey();

            Long todayResult = cacheService.increment(todayKey);
            if (todayResult != null && todayResult == 1) {
                cacheService.expire(todayKey, Duration.ofHours(48));
            }

            cacheService.increment(totalKey);

        } catch (Exception e) {
        }
    }

    public void refreshStats() {
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldStats() {
        try {
            String pattern = properties.getCache().getStatsPrefix() + "*:20*";
            cacheService.evictPattern(pattern);
        } catch (Exception e) {
        }
    }

    public void resetTodayStats() {
        String todayKey = buildTodayKey();
        cacheService.evict(todayKey);
    }

    public LeadStats getStatsForDate(LocalDate date) {
        try {
            String dateKey = buildDateKey(date);
            String count = cacheService.get(dateKey);

            return LeadStats.builder()
                    .todayCount(count != null ? Integer.parseInt(count) : 0)
                    .totalCount(0)
                    .lastUpdated(LocalDateTime.now().toString())
                    .build();
        } catch (Exception e) {
            return createEmptyStats();
        }
    }

    private String buildTodayKey() {
        return properties.getCache().getStatsPrefix() + "TODAY:" + LocalDate.now();
    }

    private String buildTotalKey() {
        return properties.getCache().getStatsPrefix() + "TOTAL";
    }

    private String buildDateKey(LocalDate date) {
        return properties.getCache().getStatsPrefix() + "DATE:" + date;
    }

    private LeadStats createEmptyStats() {
        return LeadStats.builder()
                .todayCount(0)
                .totalCount(0)
                .lastUpdated(LocalDateTime.now().toString())
                .build();
    }

    public StatsSummary getStatsSummary() {
        LeadStats current = getLeadStats();
        LeadStats yesterday = getStatsForDate(LocalDate.now().minusDays(1));

        return StatsSummary.builder()
                .current(current)
                .previousDay(yesterday)
                .growthRate(calculateGrowthRate(current.getTodayCount(), yesterday.getTodayCount()))
                .build();
    }

    private double calculateGrowthRate(int current, int previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }

    @lombok.Data
    @lombok.Builder
    public static class StatsSummary {
        private LeadStats current;
        private LeadStats previousDay;
        private double growthRate;

        public boolean isGrowing() {
            return growthRate > 0;
        }

        public String getGrowthDescription() {
            if (growthRate > 0) {
                return String.format("+%.1f%% vs yesterday", growthRate);
            } else if (growthRate < 0) {
                return String.format("%.1f%% vs yesterday", growthRate);
            } else {
                return "No change vs yesterday";
            }
        }
    }
}
