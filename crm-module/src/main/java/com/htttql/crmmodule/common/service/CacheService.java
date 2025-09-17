package com.htttql.crmmodule.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.function.Supplier;

/**
 * Generic caching service for Redis operations
 */
@Service
@RequiredArgsConstructor
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public <T> T getOrCompute(String key, Supplier<T> supplier, Duration ttl) {
        try {
            @SuppressWarnings("unchecked")
            T cached = (T) redisTemplate.opsForValue().get(key);
            if (cached != null) {
                return cached;
            }
        } catch (Exception e) {
        }

        T computed = supplier.get();

        try {
            redisTemplate.opsForValue().set(key, computed, ttl);
        } catch (Exception e) {
        }

        return computed;
    }

    public <T> T get(String key) {
        try {
            @SuppressWarnings("unchecked")
            T cached = (T) redisTemplate.opsForValue().get(key);
            return cached;
        } catch (Exception e) {
            return null;
        }
    }

    public void put(String key, Object value, Duration ttl) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl);
        } catch (Exception e) {
        }
    }

    public void evict(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
        }
    }

    public void evictPattern(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
        }
    }

    public boolean exists(String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            return false;
        }
    }

    public Long increment(String key) {
        try {
            return redisTemplate.opsForValue().increment(key);
        } catch (Exception e) {
            return null;
        }
    }

    public void expire(String key, Duration ttl) {
        try {
            redisTemplate.expire(key, ttl);
        } catch (Exception e) {
        }
    }
}
