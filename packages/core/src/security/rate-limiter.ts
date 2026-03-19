/**
 * Token Bucket Rate Limiter
 * 
 * Implements the token bucket algorithm for rate limiting API requests.
 * Supports per-key limits with automatic token refill.
 */

export interface RateLimitConfig {
  /**
   * Maximum number of tokens in the bucket
   */
  capacity: number;

  /**
   * Number of tokens to add per interval
   */
  refillRate: number;

  /**
   * Refill interval in milliseconds
   */
  refillInterval: number;

  /**
   * Cost per request (default: 1)
   */
  cost?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number;
  refillInterval: number;
}

export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      capacity: config.capacity,
      refillRate: config.refillRate,
      refillInterval: config.refillInterval,
      cost: config.cost || 1
    };
  }

  /**
   * Check if a request is allowed and consume tokens if so
   */
  consume(key: string, cost: number = this.config.cost): RateLimitResult {
    const bucket = this.getOrCreateBucket(key);
    this.refillBucket(bucket);

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: this.calculateResetTime(bucket)
      };
    }

    // Calculate retry after time
    const tokensNeeded = cost - bucket.tokens;
    const refillsNeeded = Math.ceil(tokensNeeded / bucket.refillRate);
    const retryAfter = refillsNeeded * bucket.refillInterval;

    return {
      allowed: false,
      remaining: 0,
      resetAt: this.calculateResetTime(bucket),
      retryAfter: Date.now() + retryAfter
    };
  }

  /**
   * Check if a request would be allowed without consuming tokens
   */
  check(key: string, cost: number = this.config.cost): RateLimitResult {
    const bucket = this.getOrCreateBucket(key);
    this.refillBucket(bucket);

    return {
      allowed: bucket.tokens >= cost,
      remaining: Math.floor(bucket.tokens),
      resetAt: this.calculateResetTime(bucket)
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.buckets.clear();
  }

  /**
   * Get current bucket state for debugging
   */
  getState(key: string): { tokens: number; capacity: number } | null {
    const bucket = this.buckets.get(key);
    if (!bucket) return null;

    this.refillBucket(bucket);
    return {
      tokens: bucket.tokens,
      capacity: bucket.capacity
    };
  }

  private getOrCreateBucket(key: string): TokenBucket {
    let bucket = this.buckets.get(key);
    
    if (!bucket) {
      bucket = {
        tokens: this.config.capacity,
        lastRefill: Date.now(),
        capacity: this.config.capacity,
        refillRate: this.config.refillRate,
        refillInterval: this.config.refillInterval
      };
      this.buckets.set(key, bucket);
    }

    return bucket;
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const intervalsElapsed = Math.floor(timePassed / bucket.refillInterval);

    if (intervalsElapsed > 0) {
      const tokensToAdd = intervalsElapsed * bucket.refillRate;
      bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  private calculateResetTime(bucket: TokenBucket): number {
    const now = Date.now();
    const timeSinceRefill = now - bucket.lastRefill;
    const timeUntilNextRefill = bucket.refillInterval - (timeSinceRefill % bucket.refillInterval);
    return now + timeUntilNextRefill;
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimitPresets = {
  /**
   * Strict: 10 requests per minute
   */
  strict: (): RateLimiter => new RateLimiter({
    capacity: 10,
    refillRate: 10,
    refillInterval: 60000 // 1 minute
  }),

  /**
   * Standard: 60 requests per minute
   */
  standard: (): RateLimiter => new RateLimiter({
    capacity: 60,
    refillRate: 60,
    refillInterval: 60000 // 1 minute
  }),

  /**
   * Relaxed: 120 requests per minute
   */
  relaxed: (): RateLimiter => new RateLimiter({
    capacity: 120,
    refillRate: 120,
    refillInterval: 60000 // 1 minute
  }),

  /**
   * Burst: 100 requests initially, then 10 per second
   */
  burst: (): RateLimiter => new RateLimiter({
    capacity: 100,
    refillRate: 10,
    refillInterval: 1000 // 1 second
  })
};

/**
 * Create a rate limiter with custom configuration
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}
