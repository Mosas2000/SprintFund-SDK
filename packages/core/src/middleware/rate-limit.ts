/**
 * Rate Limiting Middleware
 * 
 * Express-compatible middleware for automatic rate limiting.
 */

import { RateLimiter, RateLimitConfig } from '../security/rate-limiter';

export interface RateLimitMiddlewareOptions extends RateLimitConfig {
  /**
   * Function to extract key from request (default: IP address)
   */
  keyGenerator?: (req: any) => string;

  /**
   * Handler for rate limit exceeded
   */
  onLimitExceeded?: (req: any, res: any, result: any) => void;

  /**
   * Skip rate limiting for certain requests
   */
  skip?: (req: any) => boolean;

  /**
   * Custom cost calculator
   */
  costCalculator?: (req: any) => number;
}

/**
 * Create rate limiting middleware
 */
export function rateLimitMiddleware(options: RateLimitMiddlewareOptions) {
  const limiter = new RateLimiter({
    capacity: options.capacity,
    refillRate: options.refillRate,
    refillInterval: options.refillInterval,
    cost: options.cost
  });

  const keyGenerator = options.keyGenerator || defaultKeyGenerator;
  const costCalculator = options.costCalculator || (() => options.cost || 1);

  return async (req: any, res: any, next: any) => {
    // Skip if configured
    if (options.skip && options.skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const cost = costCalculator(req);

    const result = limiter.consume(key, cost);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', options.capacity);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt);

    if (!result.allowed) {
      if (result.retryAfter) {
        res.setHeader('Retry-After', Math.ceil((result.retryAfter - Date.now()) / 1000));
      }

      if (options.onLimitExceeded) {
        return options.onLimitExceeded(req, res, result);
      }

      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: result.retryAfter,
        limit: options.capacity,
        resetAt: result.resetAt
      });
    }

    next();
  };
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(req: any): string {
  return (
    req.ip ||
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    'unknown'
  );
}

/**
 * Key generator based on API key
 */
export function apiKeyGenerator(headerName: string = 'x-api-key') {
  return (req: any): string => {
    const apiKey = req.headers[headerName] || req.headers[headerName.toLowerCase()];
    return apiKey || defaultKeyGenerator(req);
  };
}

/**
 * Key generator based on user ID
 */
export function userIdGenerator(userIdField: string = 'userId') {
  return (req: any): string => {
    const userId = req.user?.[userIdField] || req[userIdField];
    return userId ? `user:${userId}` : defaultKeyGenerator(req);
  };
}

/**
 * Cost calculator based on request size
 */
export function requestSizeCostCalculator(bytesPerToken: number = 1024) {
  return (req: any): number => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    return Math.max(1, Math.ceil(contentLength / bytesPerToken));
  };
}

/**
 * Cost calculator based on endpoint
 */
export function endpointCostCalculator(costs: Record<string, number>, defaultCost: number = 1) {
  return (req: any): number => {
    const path = req.path || req.url;
    return costs[path] || defaultCost;
  };
}
