package com.htttql.crmmodule.common.service;

import com.htttql.crmmodule.common.enums.ResponseContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Response Security Service - Determines appropriate response context
 * based on user role and request context
 */
@Service
public class ResponseSecurityService {

    /**
     * Determine response context based on current user role
     */
    public ResponseContext determineResponseContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseContext.PUBLIC;
        }

        String role = auth.getAuthorities().iterator().next().getAuthority();

        return switch (role) {
            case "ROLE_MANAGER" -> ResponseContext.BUSINESS;
            case "ROLE_TECHNICIAN", "ROLE_RECEPTIONIST" -> ResponseContext.DETAIL;
            default -> ResponseContext.BASIC;
        };
    }

    /**
     * Check if current user can access business data
     */
    public boolean canAccessBusinessData() {
        return determineResponseContext() == ResponseContext.BUSINESS;
    }

    /**
     * Check if current user can access detailed data
     */
    public boolean canAccessDetailedData() {
        ResponseContext context = determineResponseContext();
        return context == ResponseContext.BUSINESS || context == ResponseContext.DETAIL;
    }

    /**
     * Get current user role
     */
    public String getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "ANONYMOUS";
        }
        return auth.getAuthorities().iterator().next().getAuthority();
    }
}
