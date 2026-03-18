import { BigIntString } from '../types/index.js';

/**
 * In-memory cache for contract read operations
 */
export class SimpleCache {
  private cache: Map<string, { value: unknown; expiresAt: number }> = new Map();
  private readonly defaultTtlMs: number = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: unknown, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
}

export const globalCache = new SimpleCache();
