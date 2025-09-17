package com.htttql.crmmodule.debug;

import com.htttql.crmmodule.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Debug controller for OTP troubleshooting - only enabled in non-prod environments
 */
@RestController
@RequestMapping("/api/debug/otp")
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "debug.otp.enabled", havingValue = "true", matchIfMissing = false)
public class OtpDebugController {

    private final RedisTemplate<String, String> redisTemplate;

    /**
     * Check OTP status for a user
     */
    @GetMapping("/check/{username}")
    public ApiResponse<Map<String, Object>> checkOtpStatus(@PathVariable String username) {
        Map<String, Object> result = new HashMap<>();
        
        // Check all possible OTP keys for this user
        String loginOtpKey = "OTP:LOGIN:" + username;
        String attemptKey = "OTP_ATTEMPT:" + username;
        
        // Get OTP value
        String storedOtp = redisTemplate.opsForValue().get(loginOtpKey);
        String attempts = redisTemplate.opsForValue().get(attemptKey);
        
        // Get TTL (time to live) for keys
        Long otpTtl = redisTemplate.getExpire(loginOtpKey);
        Long attemptTtl = redisTemplate.getExpire(attemptKey);
        
        result.put("username", username);
        result.put("loginOtpKey", loginOtpKey);
        result.put("attemptKey", attemptKey);
        result.put("storedOtp", storedOtp);
        result.put("attemptCount", attempts);
        result.put("otpTtlSeconds", otpTtl);
        result.put("attemptTtlSeconds", attemptTtl);
        result.put("otpExists", storedOtp != null);
        result.put("otpExpired", storedOtp == null || otpTtl <= 0);
        
        log.info("OTP Debug - User: {}, OTP: {}, Attempts: {}, TTL: {}s", 
                username, storedOtp, attempts, otpTtl);
        
        return ApiResponse.success(result, "OTP debug info retrieved");
    }

    /**
     * List all OTP-related keys in Redis
     */
    @GetMapping("/keys")
    public ApiResponse<Map<String, Object>> getAllOtpKeys() {
        Map<String, Object> result = new HashMap<>();
        
        Set<String> otpKeys = redisTemplate.keys("OTP:*");
        Set<String> attemptKeys = redisTemplate.keys("OTP_ATTEMPT:*");
        
        Map<String, String> otpValues = new HashMap<>();
        Map<String, String> attemptValues = new HashMap<>();
        
        if (otpKeys != null) {
            for (String key : otpKeys) {
                String value = redisTemplate.opsForValue().get(key);
                Long ttl = redisTemplate.getExpire(key);
                otpValues.put(key, value + " (TTL: " + ttl + "s)");
            }
        }
        
        if (attemptKeys != null) {
            for (String key : attemptKeys) {
                String value = redisTemplate.opsForValue().get(key);
                Long ttl = redisTemplate.getExpire(key);
                attemptValues.put(key, value + " (TTL: " + ttl + "s)");
            }
        }
        
        result.put("otpKeys", otpValues);
        result.put("attemptKeys", attemptValues);
        result.put("totalOtpKeys", otpKeys != null ? otpKeys.size() : 0);
        result.put("totalAttemptKeys", attemptKeys != null ? attemptKeys.size() : 0);
        
        return ApiResponse.success(result, "All OTP keys retrieved");
    }

    /**
     * Clear OTP for a specific user (for testing)
     */
    @DeleteMapping("/clear/{username}")
    public ApiResponse<String> clearOtpForUser(@PathVariable String username) {
        String loginOtpKey = "OTP:LOGIN:" + username;
        String attemptKey = "OTP_ATTEMPT:" + username;
        
        boolean otpDeleted = Boolean.TRUE.equals(redisTemplate.delete(loginOtpKey));
        boolean attemptDeleted = Boolean.TRUE.equals(redisTemplate.delete(attemptKey));
        
        log.info("OTP cleared for user: {} - OTP deleted: {}, Attempt deleted: {}", 
                username, otpDeleted, attemptDeleted);
        
        return ApiResponse.success("OTP cleared", 
                String.format("OTP cleared for user: %s (OTP: %s, Attempts: %s)", 
                        username, otpDeleted, attemptDeleted));
    }
}