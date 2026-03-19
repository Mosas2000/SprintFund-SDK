import { BaseClient } from './base.js';
import { globalCache } from '../utils/cache.js';
import { validateAddress } from '../errors/validation.js';
import { isStakeBalance } from '../types/contract.js';
import { throwNetworkError } from '../errors/network.js';
/**
 * Client for stake-related contract operations
 */
export class StakeClient extends BaseClient {
    constructor(networkType = 'mainnet') {
        super(networkType);
        this.cacheKeyPrefix = 'stakes:';
        this.cacheTtl = 10 * 60 * 1000; // 10 minutes for stake data
    }
    /**
     * Get stake balance for an address
     */
    async getBalance(holder) {
        const cacheKey = `${this.cacheKeyPrefix}balance:${holder}`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            validateAddress(holder);
            const balance = await this.fetchBalanceFromChain(holder);
            if (balance) {
                globalCache.set(cacheKey, balance, this.cacheTtl);
            }
            return balance;
        }
        catch (error) {
            if (error instanceof Error) {
                throwNetworkError(`Failed to fetch balance for ${holder}: ${error.message}`, {
                    holder,
                    network: this.getNetworkType(),
                });
            }
            return null;
        }
    }
    /**
     * List stake holders with pagination
     */
    async listHolders(options) {
        const cacheKey = `${this.cacheKeyPrefix}list:${options.limit}:${options.offset}:${options.minBalance || '0'}`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            const holders = await this.fetchHoldersFromChain(options);
            if (Array.isArray(holders) && holders.every(isStakeBalance)) {
                globalCache.set(cacheKey, holders, this.cacheTtl);
            }
            return holders;
        }
        catch (error) {
            if (error instanceof Error) {
                throwNetworkError(`Failed to list stake holders: ${error.message}`, {
                    limit: options.limit,
                    offset: options.offset,
                    network: this.getNetworkType(),
                });
            }
            return [];
        }
    }
    /**
     * Get top stake holders
     */
    async getTopHolders(count = 10) {
        return this.listHolders({
            limit: count,
            offset: 0,
        });
    }
    /**
     * Get total staked amount
     */
    async getTotalStaked() {
        const cacheKey = `${this.cacheKeyPrefix}total-staked`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            const total = await this.fetchTotalStaked();
            globalCache.set(cacheKey, total, this.cacheTtl);
            return total;
        }
        catch (error) {
            if (error instanceof Error) {
                throwNetworkError(`Failed to get total staked: ${error.message}`, {
                    network: this.getNetworkType(),
                });
            }
            return '0';
        }
    }
    /**
     * Invalidate stake cache
     */
    invalidateCache(holder) {
        if (holder) {
            globalCache.delete(`${this.cacheKeyPrefix}balance:${holder}`);
        }
        else {
            globalCache.invalidatePattern(new RegExp(`^${this.cacheKeyPrefix}`));
        }
    }
    async fetchBalanceFromChain(_holder) {
        // Placeholder for actual chain interaction
        return null;
    }
    async fetchHoldersFromChain(_options) {
        // Placeholder for actual chain interaction
        return [];
    }
    async fetchTotalStaked() {
        // Placeholder for actual chain interaction
        return '0';
    }
}
//# sourceMappingURL=stakes.js.map