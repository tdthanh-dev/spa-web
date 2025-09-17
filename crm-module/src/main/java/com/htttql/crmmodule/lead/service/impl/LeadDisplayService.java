package com.htttql.crmmodule.lead.service.impl;

import com.htttql.crmmodule.common.enums.LeadStatus;
import com.htttql.crmmodule.lead.entity.Lead;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service for lead display formatting and helper methods
 */
@Service
public class LeadDisplayService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public String getDisplayStatus(LeadStatus status) {
        if (status == null) {
            return "Unknown";
        }
        return switch (status) {
            case NEW -> "Mới";
            case IN_PROGRESS -> "Đang xử lý";
            case WON -> "Đã chuyển đổi";
            case LOST -> "Mất khách";
        };
    }

    public String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATE_FORMATTER);
    }

    public String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATE_TIME_FORMATTER);
    }

    public boolean isConverted(Lead lead) {
        return lead.getCustomerId() != null ||
               Boolean.TRUE.equals(lead.getIsExistingCustomer());
    }

    public String detectLeadSource(Lead lead) {
        if (lead.getUserAgent() != null) {
            String ua = lead.getUserAgent().toLowerCase();

            if (ua.contains("mobile") || ua.contains("android") ||
                ua.contains("iphone") || ua.contains("ipad") ||
                ua.contains("blackberry") || ua.contains("windows phone")) {
                return "Mobile App";
            }

            if (ua.contains("bot") || ua.contains("crawler") ||
                ua.contains("spider") || ua.contains("scraper")) {
                return "Bot/Automated";
            }
        }

        if (lead.getIpAddress() != null) {
            String ip = lead.getIpAddress();

            if (ip.startsWith("192.168.") || ip.startsWith("10.") ||
                ip.startsWith("172.") || ip.equals("127.0.0.1") ||
                ip.equals("localhost")) {
                return "Internal/Development";
            }
        }

        return "Website/Public API";
    }

    public long getLeadAgeInDays(Lead lead) {
        if (lead.getCreatedAt() == null) {
            return 0;
        }
        return java.time.Duration.between(lead.getCreatedAt(), LocalDateTime.now()).toDays();
    }

    public boolean isOldLead(Lead lead) {
        return getLeadAgeInDays(lead) > 30;
    }
}
