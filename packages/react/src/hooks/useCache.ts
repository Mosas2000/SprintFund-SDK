/**
 * Cache Hook for Advanced Caching
 * 
 * React hook integrating advanced caching strategies.
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CacheStrategy, getCacheStrategy } from './strategies';

export interface UseCacheOptions {
  /**
   * Cache strategy key or custom config
   */
  strategy?: keyof typeof import('./strategies').CacheStrategies | CacheStrategy;

  /**
   * Keys to invalidate when this query succeeds
   */
  invalidateOn?: (string | RegExp)[];

  /**
   * Deduplicate requests within window (ms)
   */
  dedupeWindow?: number;
}

/**
 * Hook for query with advanced caching
 */
export function useCache<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: UseCacheOptions
) {
  const queryClient = useQueryClient();

  // Get cache strategy
  let cacheStrategy: CacheStrategy;
  if (options?.strategy && typeof options.strategy === 'string') {
    cacheStrategy = getCacheStrategy(options.strategy);
  } else if (options?.strategy) {
    cacheStrategy = options.strategy;
  } else {
    cacheStrategy = getCacheStrategy('standard');
  }

  // Execute query with caching
  const query = useQuery({
    queryKey,
    queryFn,
    staleTime: cacheStrategy.staleTime,
    gcTime: cacheStrategy.cacheTime,
    refetchOnWindowFocus: cacheStrategy.refetchOnWindowFocus,
    refetchOnMount: cacheStrategy.refetchOnMount as any,
    refetchInterval: cacheStrategy.refetchInterval
  });

  // Invalidate related keys on success
  const invalidateRelated = useCallback(async () => {
    if (options?.invalidateOn) {
      for (const pattern of options.invalidateOn) {
        if (typeof pattern === 'string') {
          await queryClient.invalidateQueries({ queryKey: [pattern] });
        } else {
          // For regex patterns, we'd need access to all query keys
          // This is a simplified implementation
          await queryClient.invalidateQueries();
        }
      }
    }
  }, [queryClient, options?.invalidateOn]);

  return {
    ...query,
    invalidateRelated
  };
}

export default useCache;
