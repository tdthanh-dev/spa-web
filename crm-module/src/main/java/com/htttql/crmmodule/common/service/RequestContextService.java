package com.htttql.crmmodule.common.service;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Service for extracting request context information
 */
@Service
@RequiredArgsConstructor
public class RequestContextService {

    public RequestContext getCurrentContext() {
        return RequestContext.builder()
                .ipAddress(getClientIpAddress())
                .userAgent(getUserAgent())
                .build();
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
        }
        return "unknown";
    }

    private String getUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getHeader("User-Agent");
            }
        } catch (Exception e) {
        }
        return "unknown";
    }

    @Data
    @Builder
    public static class RequestContext {
        private String ipAddress;
        private String userAgent;

        public boolean isValid() {
            return ipAddress != null && !ipAddress.isEmpty() &&
                   !"unknown".equals(ipAddress);
        }
    }
}
