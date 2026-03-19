import { BaseClient } from './base.js';
import { StakeBalance, StakeListOptions } from '../types/stake.js';
import { BigIntString, Principal } from '../types/index.js';
import { NetworkType } from '../types/index.js';
/**
 * Client for stake-related contract operations
 */
export declare class StakeClient extends BaseClient {
    private readonly cacheKeyPrefix;
    private readonly cacheTtl;
    constructor(networkType?: NetworkType);
    /**
     * Get stake balance for an address
     */
    getBalance(holder: Principal): Promise<BigIntString | null>;
    /**
     * List stake holders with pagination
     */
    listHolders(options: StakeListOptions): Promise<StakeBalance[]>;
    /**
     * Get top stake holders
     */
    getTopHolders(count?: number): Promise<StakeBalance[]>;
    /**
     * Get total staked amount
     */
    getTotalStaked(): Promise<BigIntString>;
    /**
     * Invalidate stake cache
     */
    invalidateCache(holder?: Principal): void;
    private fetchBalanceFromChain;
    private fetchHoldersFromChain;
    private fetchTotalStaked;
}
//# sourceMappingURL=stakes.d.ts.map