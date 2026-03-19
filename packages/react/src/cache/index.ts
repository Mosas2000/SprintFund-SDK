/**
 * @sf-protocol/react - Caching Module
 */

export {
  CacheStrategies,
  getCacheStrategy,
  createCacheStrategy
} from './strategies';
export type { CacheStrategy } from './strategies';

export {
  RequestDeduplicator,
  NetworkAwareCache,
  createSWRCache
} from './swr';
export type { SWRConfig } from './swr';

export {
  CacheInvalidationManager,
  InvalidationPatterns,
  createCacheInvalidationManager
} from './invalidation';
export type { InvalidationRule } from './invalidation';
