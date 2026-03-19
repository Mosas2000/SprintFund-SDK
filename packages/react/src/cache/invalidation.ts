/**
 * Intelligent Cache Invalidation
 * 
 * Smart invalidation based on data dependencies and relationships.
 */

export interface InvalidationRule {
  /**
   * Query key pattern to match
   */
  pattern: string | RegExp;

  /**
   * Keys to invalidate when pattern matches
   */
  invalidateKeys: (string | RegExp)[];

  /**
   * When to apply rule
   */
  when?: 'immediate' | 'onSuccess' | 'onError';
}

/**
 * Manages cache invalidation rules
 */
export class CacheInvalidationManager {
  private rules: InvalidationRule[] = [];
  private invalidationHistory: Map<string, number> = new Map();
  private maxHistorySize = 100;

  /**
   * Add invalidation rule
   */
  addRule(rule: InvalidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove invalidation rule
   */
  removeRule(pattern: string | RegExp): void {
    this.rules = this.rules.filter(r => r.pattern !== pattern);
  }

  /**
   * Get invalidation keys for a given key
   */
  getInvalidationKeys(triggerKey: string): (string | RegExp)[] {
    const keysToInvalidate: (string | RegExp)[] = [];

    for (const rule of this.rules) {
      const matches =
        typeof rule.pattern === 'string'
          ? rule.pattern === triggerKey
          : rule.pattern.test(triggerKey);

      if (matches) {
        keysToInvalidate.push(...rule.invalidateKeys);
      }
    }

    return keysToInvalidate;
  }

  /**
   * Record invalidation
   */
  recordInvalidation(key: string): void {
    this.invalidationHistory.set(key, Date.now());

    // Keep history size under control
    if (this.invalidationHistory.size > this.maxHistorySize) {
      const oldestKey = Array.from(this.invalidationHistory.entries()).sort(
        (a, b) => a[1] - b[1]
      )[0][0];
      this.invalidationHistory.delete(oldestKey);
    }
  }

  /**
   * Get last invalidation time
   */
  getLastInvalidation(key: string): number | undefined {
    return this.invalidationHistory.get(key);
  }

  /**
   * Check if recently invalidated
   */
  isRecentlyInvalidated(key: string, windowMs: number = 1000): boolean {
    const lastInvalidation = this.getLastInvalidation(key);
    if (!lastInvalidation) return false;
    return Date.now() - lastInvalidation < windowMs;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.invalidationHistory.clear();
  }
}

/**
 * Common invalidation patterns
 */
export const InvalidationPatterns = {
  /**
   * Invalidate related proposals when voting
   */
  voteInvalidation: {
    pattern: /vote/i,
    invalidateKeys: [/proposals/, /stakes/]
  } as InvalidationRule,

  /**
   * Invalidate stats when stake changes
   */
  stakeInvalidation: {
    pattern: /stake/i,
    invalidateKeys: [/voting-power/, /leaderboard/, /analytics/]
  } as InvalidationRule,

  /**
   * Invalidate dependent queries on proposal creation
   */
  proposalInvalidation: {
    pattern: /proposal/i,
    invalidateKeys: [/proposals/, /user-proposals/, /trending/]
  } as InvalidationRule
};

/**
 * Create cache invalidation manager with default rules
 */
export function createCacheInvalidationManager(
  customRules?: InvalidationRule[]
): CacheInvalidationManager {
  const manager = new CacheInvalidationManager();

  // Add default rules
  manager.addRule(InvalidationPatterns.voteInvalidation);
  manager.addRule(InvalidationPatterns.stakeInvalidation);
  manager.addRule(InvalidationPatterns.proposalInvalidation);

  // Add custom rules
  if (customRules) {
    for (const rule of customRules) {
      manager.addRule(rule);
    }
  }

  return manager;
}
