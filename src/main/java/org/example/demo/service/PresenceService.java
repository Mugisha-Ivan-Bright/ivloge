package org.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class PresenceService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String PRESENCE_KEY_PREFIX = "presence:";
    private static final long PRESENCE_TTL = 30000; // 30 seconds

    public void setOnline(String username) {
        redisTemplate.opsForValue().set(
                PRESENCE_KEY_PREFIX + username, "online",
                PRESENCE_TTL, TimeUnit.MILLISECONDS);
    }

    public void setOffline(String username) {
        redisTemplate.delete(PRESENCE_KEY_PREFIX + username);
    }

    public boolean isOnline(String username) {
        return redisTemplate.hasKey(PRESENCE_KEY_PREFIX + username);
    }
    
    // In a production app, we would also publish a "status changed" event to Redis Pub/Sub
}
