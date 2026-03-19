/**
 * Advanced Cache Strategies for React Query
 * 
 * Implements stale-while-revalidate, time-based, and intelligent invalidation patterns.
 */

export interface CacheStrategy {
  /**
   * Stale time in milliseconds
   */
  staleTime: number;

  /**
   * Cache time in milliseconds (how long to keep in memory)
   */
  cacheTime: number;

  /**
   * Enable background refetch
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Refetch on mount if stale
   */
  refetchOnMount?: boolean | 'stale';

  /**
   * Refetch interval in milliseconds
   */
  refetchInterval?: number;
}

/**
 * Predefined cache strategies
 */
export const CacheStrategies = {
  /**
   * Aggressive: Always fresh
   */
  aggressive: {
    staleTime: 0,
    cacheTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true
  } as CacheStrategy,

  /**
   * Standard: Fresh for 5 minutes
   */
  standard: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: 'stale' as any,
    refetchOnMount: 'stale' as any
  } as CacheStrategy,

  /**
   * Relaxed: Fresh for 30 minutes
   */
  relaxed: {
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  } as CacheStrategy,

  /**
   * Real-time: Refetch every 10 seconds
   */
  realtime: {
    staleTime: 0,
    cacheTime: 30 * 60 * 1000,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true
  } as CacheStrategy,

  /**
   * Offline: No refetch, long cache
   */
  offline: {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  } as CacheStrategy
};

/**
 * Get cache strategy by key
 */
export function getCacheStrategy(key: keyof typeof CacheStrategies): CacheStrategy {
  return CacheStrategies[key];
}

/**
 * Create custom cache strategy
 */
export function createCacheStrategy(
  staleTime: number,
  cacheTime: number,
  options?: Partial<CacheStrategy>
): CacheStrategy {
  return {
    staleTime,
    cacheTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? 'stale',
    refetchInterval: options?.refetchInterval
  };
}
