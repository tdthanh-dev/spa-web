package com.htttql.crmmodule.security.service;

import com.htttql.crmmodule.common.exception.UnauthorizedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service for handling security context operations
 */
@Slf4j
@Service
public class SecurityContextService {

    /**
     * Get current staff ID from JWT token
     * 
     * @return current staff ID
     * @throws UnauthorizedException if no authentication or invalid token
     */
    public Long getCurrentStaffId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                throw new UnauthorizedException("No authentication found");
            }

            // Get username from authentication principal
            String username = authentication.getName();

            // Extract staff ID from JWT token if available in security context
            // This assumes the staff ID is stored in the JWT claims during authentication
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserPrincipal) {
                // Principal is UserPrincipal object, get ID directly
                UserPrincipal userPrincipal = (UserPrincipal) principal;
                return userPrincipal.getId();
            } else if (principal instanceof String) {
                // This is the username, we need to get staff ID from database or cache
                // For now, return a placeholder - this should be improved
                log.warn("Using placeholder staff ID for username: {}", username);
                return getStaffIdFromUsername(username);
            }

            throw new UnauthorizedException("Unable to determine current staff member");

        } catch (Exception e) {
            log.error("Error getting current staff ID: {}", e.getMessage());
            throw new UnauthorizedException("Unable to determine current staff member");
        }
    }

    /**
     * Get current username from authentication context
     * 
     * @return current username
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("No authentication found");
        }

        return authentication.getName();
    }

    /**
     * Get staff ID from username
     * This is a placeholder method - in real implementation,
     * you should have a cache or database lookup
     * 
     * @param username the username
     * @return staff ID
     */
    private Long getStaffIdFromUsername(String username) {
        // This is a temporary implementation
        // In production, you should:
        // 1. Cache staff ID with username
        // 2. Or store staff ID in JWT claims during authentication
        // 3. Or lookup from database

        // For now, return hardcoded values based on known users
        // This should be replaced with proper implementation
        switch (username.toLowerCase()) {
            case "tdthanh.dev2025@gmail.com":
                return 1L; // ADMIN
            case "2251120247@ut.edu.vn":
                return 2L; // MANAGER
            case "trinhdinhthanhyahoo@gmail.com":
                return 3L; // RECEPTIONIST
            case "technician1@crm.com":
                return 4L; // TECHNICIAN
            case "technician2@crm.com":
                return 5L; // TECHNICIAN
            default:
                log.warn("Unknown username: {}, returning default staff ID", username);
                return 1L; // Default fallback
        }
    }

    /**
     * Check if current user has a specific role
     * 
     * @param role the role to check
     * @return true if user has the role
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    /**
     * Check if current user is authenticated
     * 
     * @return true if authenticated
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}
