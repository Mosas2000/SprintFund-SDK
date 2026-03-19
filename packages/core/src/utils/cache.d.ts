/**
 * In-memory cache for contract read operations
 */
export declare class SimpleCache {
    private cache;
    private readonly defaultTtlMs;
    set(key: string, value: unknown, ttlMs?: number): void;
    get<T>(key: string): T | undefined;
    has(key: string): boolean;
    delete(key: string): void;
    clear(): void;
    invalidatePattern(pattern: RegExp): number;
}
export declare const globalCache: SimpleCache;
//# sourceMappingURL=cache.d.ts.map