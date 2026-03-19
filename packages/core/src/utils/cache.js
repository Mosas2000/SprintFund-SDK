/**
 * In-memory cache for contract read operations
 */
export class SimpleCache {
    constructor() {
        this.cache = new Map();
        this.defaultTtlMs = 5 * 60 * 1000; // 5 minutes
    }
    set(key, value, ttlMs) {
        const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
        this.cache.set(key, { value, expiresAt });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return undefined;
        if (entry.expiresAt < Date.now()) {
            this.cache.delete(key);
            return undefined;
        }
        return entry.value;
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (entry.expiresAt < Date.now()) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    invalidatePattern(pattern) {
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
//# sourceMappingURL=cache.js.map