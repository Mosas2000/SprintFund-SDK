/**
 * Fallback Handler
 * 
 * Provides fallback mechanisms for degraded service scenarios.
 */

export interface FallbackConfig {
  /**
   * Primary function to execute
   */
  primary: () => Promise<any>;

  /**
   * Fallback function to execute if primary fails
   */
  fallback: () => Promise<any>;

  /**
   * Function to determine if error should trigger fallback
   */
  shouldFallback?: (error: Error) => boolean;

  /**
   * Fallback cache TTL in milliseconds
   */
  cacheTTL?: number;
}

export interface FallbackResult<T> {
  success: boolean;
  data: T;
  fromFallback: boolean;
  error?: Error;
  cachedAt?: number;
}

export class FallbackHandler {
  private cache: Map<string, { value: any; timestamp: number }> = new Map();
  private config: Required<FallbackConfig>;

  constructor(config: FallbackConfig) {
    this.config = {
      primary: config.primary,
      fallback: config.fallback,
      shouldFallback: config.shouldFallback || (() => true),
      cacheTTL: config.cacheTTL || 60000
    };
  }

  /**
   * Execute with fallback
   */
  async execute<T>(cacheKey?: string): Promise<FallbackResult<T>> {
    try {
      const result = await this.config.primary();

      // Cache successful result
      if (cacheKey) {
        this.cache.set(cacheKey, {
          value: result,
          timestamp: Date.now()
        });
      }

      return {
        success: true,
        data: result,
        fromFallback: false
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Check if error should trigger fallback
      if (!this.config.shouldFallback(err)) {
        throw error;
      }

      // Try cached value first
      if (cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
          return {
            success: true,
            data: cached.value,
            fromFallback: false,
            cachedAt: cached.timestamp
          };
        }
      }

      // Try fallback
      try {
        const fallbackResult = await this.config.fallback();

        // Cache fallback result
        if (cacheKey) {
          this.cache.set(cacheKey, {
            value: fallbackResult,
            timestamp: Date.now()
          });
        }

        return {
          success: true,
          data: fallbackResult,
          fromFallback: true
        };
      } catch (fallbackError) {
        return {
          success: false,
          data: null,
          fromFallback: true,
          error: fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError))
        };
      }
    }
  }

  /**
   * Invalidate cache
   */
  invalidateCache(cacheKey?: string): void {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Get cache entries
   */
  getCacheEntries(): Array<[string, { value: any; timestamp: number }]> {
    return Array.from(this.cache.entries());
  }

  /**
   * Clean expired cache entries
   */
  cleanupExpiredCache(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, { timestamp }] of this.cache.entries()) {
      if (now - timestamp > this.config.cacheTTL) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Create a fallback handler
 */
export function createFallbackHandler(config: FallbackConfig): FallbackHandler {
  return new FallbackHandler(config);
}
