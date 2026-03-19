import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, RateLimitPresets, createRateLimiter } from '../../../src/security/rate-limiter';

describe('RateLimiter', () => {
  describe('Token Bucket Algorithm', () => {
    it('should allow requests within capacity', () => {
      const limiter = new RateLimiter({
        capacity: 10,
        refillRate: 10,
        refillInterval: 60000
      });

      // First request should be allowed
      const result1 = limiter.consume('user1');
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(9);

      // Second request should be allowed
      const result2 = limiter.consume('user1');
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(8);
    });

    it('should deny requests when capacity exceeded', () => {
      const limiter = new RateLimiter({
        capacity: 2,
        refillRate: 2,
        refillInterval: 60000
      });

      // Consume all tokens
      limiter.consume('user1');
      limiter.consume('user1');

      // Third request should be denied
      const result = limiter.consume('user1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it('should track different keys separately', () => {
      const limiter = new RateLimiter({
        capacity: 2,
        refillRate: 2,
        refillInterval: 60000
      });

      // User1 consumes all tokens
      limiter.consume('user1');
      limiter.consume('user1');

      // User2 should still have tokens
      const result = limiter.consume('user2');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should refill tokens over time', async () => {
      const limiter = new RateLimiter({
        capacity: 10,
        refillRate: 5,
        refillInterval: 100 // 100ms
      });

      // Consume 8 tokens
      for (let i = 0; i < 8; i++) {
        limiter.consume('user1');
      }

      const before = limiter.check('user1');
      expect(before.remaining).toBe(2);

      // Wait for refill
      await new Promise(resolve => setTimeout(resolve, 150));

      const after = limiter.consume('user1');
      expect(after.allowed).toBe(true);
      expect(after.remaining).toBeGreaterThan(before.remaining);
    });

    it('should respect custom cost per request', () => {
      const limiter = new RateLimiter({
        capacity: 10,
        refillRate: 10,
        refillInterval: 60000
      });

      // Consume 5 tokens
      const result = limiter.consume('user1', 5);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it('should not refill beyond capacity', async () => {
      const limiter = new RateLimiter({
        capacity: 10,
        refillRate: 20,
        refillInterval: 100
      });

      // Wait for refill
      await new Promise(resolve => setTimeout(resolve, 150));

      const state = limiter.getState('user1');
      expect(state?.tokens).toBeLessThanOrEqual(10);
    });
  });

  describe('check method', () => {
    it('should check without consuming tokens', () => {
      const limiter = new RateLimiter({
        capacity: 10,
        refillRate: 10,
        refillInterval: 60000
      });

      const result1 = limiter.check('user1');
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(10);

      const result2 = limiter.check('user1');
      expect(result2.remaining).toBe(10); // Should still be 10
    });
  });

  describe('reset and clear', () => {
    it('should reset rate limit for specific key', () => {
      const limiter = new RateLimiter({
        capacity: 2,
        refillRate: 2,
        refillInterval: 60000
      });

      limiter.consume('user1');
      limiter.consume('user1');

      const before = limiter.consume('user1');
      expect(before.allowed).toBe(false);

      limiter.reset('user1');

      const after = limiter.consume('user1');
      expect(after.allowed).toBe(true);
    });

    it('should clear all rate limits', () => {
      const limiter = new RateLimiter({
        capacity: 2,
        refillRate: 2,
        refillInterval: 60000
      });

      limiter.consume('user1');
      limiter.consume('user2');

      limiter.clear();

      expect(limiter.getState('user1')).toBeNull();
      expect(limiter.getState('user2')).toBeNull();
    });
  });

  describe('Presets', () => {
    it('should create strict limiter', () => {
      const limiter = RateLimitPresets.strict();
      const state = limiter.getState('test');
      
      // Will create bucket on first access
      limiter.check('test');
      const newState = limiter.getState('test');
      
      expect(newState?.capacity).toBe(10);
    });

    it('should create standard limiter', () => {
      const limiter = RateLimitPresets.standard();
      limiter.check('test');
      const state = limiter.getState('test');
      
      expect(state?.capacity).toBe(60);
    });

    it('should create relaxed limiter', () => {
      const limiter = RateLimitPresets.relaxed();
      limiter.check('test');
      const state = limiter.getState('test');
      
      expect(state?.capacity).toBe(120);
    });

    it('should create burst limiter', () => {
      const limiter = RateLimitPresets.burst();
      limiter.check('test');
      const state = limiter.getState('test');
      
      expect(state?.capacity).toBe(100);
    });
  });

  describe('Retry After', () => {
    it('should calculate retry after time', () => {
      const limiter = new RateLimiter({
        capacity: 1,
        refillRate: 1,
        refillInterval: 1000
      });

      limiter.consume('user1');
      const result = limiter.consume('user1');

      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(Date.now());
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero capacity gracefully', () => {
      const limiter = new RateLimiter({
        capacity: 0,
        refillRate: 1,
        refillInterval: 1000
      });

      const result = limiter.consume('user1');
      expect(result.allowed).toBe(false);
    });

    it('should handle concurrent requests for same key', () => {
      const limiter = new RateLimiter({
        capacity: 10,
        refillRate: 10,
        refillInterval: 60000
      });

      const results = [];
      for (let i = 0; i < 15; i++) {
        results.push(limiter.consume('user1'));
      }

      const allowed = results.filter(r => r.allowed).length;
      const denied = results.filter(r => !r.allowed).length;

      expect(allowed).toBe(10);
      expect(denied).toBe(5);
    });
  });
});

describe('createRateLimiter', () => {
  it('should create rate limiter with config', () => {
    const limiter = createRateLimiter({
      capacity: 100,
      refillRate: 50,
      refillInterval: 1000
    });

    const result = limiter.consume('test');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(99);
  });
});
