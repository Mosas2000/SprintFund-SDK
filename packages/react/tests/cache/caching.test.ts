import { describe, it, expect, beforeEach } from 'vitest';
import {
  CacheStrategies,
  getCacheStrategy,
  createCacheStrategy
} from '../cache/strategies';
import { RequestDeduplicator, NetworkAwareCache, createSWRCache } from '../cache/swr';
import {
  CacheInvalidationManager,
  InvalidationPatterns,
  createCacheInvalidationManager
} from '../cache/invalidation';

describe('Advanced Caching Strategies', () => {
  describe('Cache Strategies', () => {
    it('should provide predefined strategies', () => {
      expect(CacheStrategies.aggressive).toBeDefined();
      expect(CacheStrategies.standard).toBeDefined();
      expect(CacheStrategies.relaxed).toBeDefined();
      expect(CacheStrategies.realtime).toBeDefined();
      expect(CacheStrategies.offline).toBeDefined();
    });

    it('should retrieve cache strategy by key', () => {
      const strategy = getCacheStrategy('standard');
      expect(strategy.staleTime).toBe(5 * 60 * 1000);
      expect(strategy.cacheTime).toBe(10 * 60 * 1000);
    });

    it('should create custom cache strategy', () => {
      const custom = createCacheStrategy(1000, 5000, {
        refetchOnWindowFocus: true
      });
      expect(custom.staleTime).toBe(1000);
      expect(custom.cacheTime).toBe(5000);
      expect(custom.refetchOnWindowFocus).toBe(true);
    });

    it('aggressive strategy should always be fresh', () => {
      const strategy = getCacheStrategy('aggressive');
      expect(strategy.staleTime).toBe(0);
      expect(strategy.refetchOnWindowFocus).toBe(true);
    });

    it('offline strategy should have infinite cache', () => {
      const strategy = getCacheStrategy('offline');
      expect(strategy.staleTime).toBe(Infinity);
      expect(strategy.cacheTime).toBe(Infinity);
    });
  });

  describe('Request Deduplicator', () => {
    let deduplicator: RequestDeduplicator;

    beforeEach(() => {
      deduplicator = new RequestDeduplicator();
    });

    it('should deduplicate identical requests', async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        return 'result';
      };

      const [result1, result2] = await Promise.all([
        deduplicator.execute('key1', fn),
        deduplicator.execute('key1', fn)
      ]);

      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(callCount).toBe(1); // Called only once
    });

    it('should execute different keys separately', async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        return 'result';
      };

      await deduplicator.execute('key1', fn);
      await deduplicator.execute('key2', fn);

      expect(callCount).toBe(2);
    });

    it('should clear in-flight requests', async () => {
      const fn = async () => 'result';
      deduplicator.execute('key1', fn);
      deduplicator.clear('key1');
      expect(deduplicator.isInFlight('key1')).toBe(false);
    });

    it('should detect in-flight requests', async () => {
      let resolve: () => void;
      const promise = new Promise<void>(r => {
        resolve = r;
      });
      const fn = async () => {
        await promise;
        return 'result';
      };

      const request = deduplicator.execute('key1', fn);
      expect(deduplicator.isInFlight('key1')).toBe(true);
      resolve!();
      await request;
      expect(deduplicator.isInFlight('key1')).toBe(false);
    });
  });

  describe('Cache Invalidation Manager', () => {
    let manager: CacheInvalidationManager;

    beforeEach(() => {
      manager = createCacheInvalidationManager();
    });

    it('should add and retrieve rules', () => {
      manager.addRule({
        pattern: 'test',
        invalidateKeys: ['related']
      });

      const keys = manager.getInvalidationKeys('test');
      expect(keys).toContain('related');
    });

    it('should match patterns', () => {
      manager.addRule({
        pattern: /vote/i,
        invalidateKeys: [/proposals/]
      });

      const keys = manager.getInvalidationKeys('vote-123');
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should record invalidations', () => {
      manager.recordInvalidation('key1');
      const time = manager.getLastInvalidation('key1');
      expect(time).toBeDefined();
      expect(Date.now() - time!).toBeLessThan(100);
    });

    it('should check recent invalidations', () => {
      manager.recordInvalidation('key1');
      expect(manager.isRecentlyInvalidated('key1', 1000)).toBe(true);
      expect(manager.isRecentlyInvalidated('key1', 0)).toBe(false);
    });

    it('should have default invalidation rules', () => {
      const voteKeys = manager.getInvalidationKeys('vote');
      const stakeKeys = manager.getInvalidationKeys('stake');

      expect(voteKeys.length).toBeGreaterThan(0);
      expect(stakeKeys.length).toBeGreaterThan(0);
    });
  });

  describe('SWR Cache', () => {
    it('should create SWR cache', () => {
      const cache = createSWRCache();
      expect(cache.deduplicator).toBeDefined();
      expect(cache.networkAware).toBeDefined();
      expect(cache.execute).toBeDefined();
      expect(cache.executeWithNetwork).toBeDefined();
    });

    it('should execute with deduplication', async () => {
      const cache = createSWRCache();
      let callCount = 0;

      const fn = async () => {
        callCount++;
        return 'result';
      };

      await cache.execute('key1', fn);
      await cache.execute('key1', fn);

      expect(callCount).toBe(1);
    });
  });
});
