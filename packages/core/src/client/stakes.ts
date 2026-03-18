import { BaseClient } from './base.js';
import { StakeBalance, StakeListOptions } from '../types/stake.js';
import { BigIntString, Principal } from '../types/index.js';
import { globalCache } from '../utils/cache.js';
import { validateAddress } from '../errors/validation.js';
import { NetworkType } from '../types/index.js';
import { isStakeBalance } from '../types/contract.js';
import { throwNetworkError } from '../errors/network.js';

/**
 * Client for stake-related contract operations
 */
export class StakeClient extends BaseClient {
  private readonly cacheKeyPrefix = 'stakes:';
  private readonly cacheTtl = 10 * 60 * 1000; // 10 minutes for stake data

  constructor(networkType: NetworkType = 'mainnet') {
    super(networkType);
  }

  /**
   * Get stake balance for an address
   */
  async getBalance(holder: Principal): Promise<BigIntString | null> {
    const cacheKey = `${this.cacheKeyPrefix}balance:${holder}`;
    const cached = globalCache.get<BigIntString>(cacheKey);
    if (cached) return cached;

    try {
      validateAddress(holder as string);
      const balance = await this.fetchBalanceFromChain(holder);
      if (balance) {
        globalCache.set(cacheKey, balance, this.cacheTtl);
      }
      return balance;
    } catch (error) {
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
  async listHolders(options: StakeListOptions): Promise<StakeBalance[]> {
    const cacheKey = `${this.cacheKeyPrefix}list:${options.limit}:${options.offset}:${options.minBalance || '0'}`;
    const cached = globalCache.get<StakeBalance[]>(cacheKey);
    if (cached) return cached;

    try {
      const holders = await this.fetchHoldersFromChain(options);
      if (Array.isArray(holders) && holders.every(isStakeBalance)) {
        globalCache.set(cacheKey, holders, this.cacheTtl);
      }
      return holders;
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(
          `Failed to list stake holders: ${error.message}`,
          {
            limit: options.limit,
            offset: options.offset,
            network: this.getNetworkType(),
          }
        );
      }
      return [];
    }
  }

  /**
   * Get top stake holders
   */
  async getTopHolders(count: number = 10): Promise<StakeBalance[]> {
    return this.listHolders({
      limit: count,
      offset: 0,
    });
  }

  /**
   * Get total staked amount
   */
  async getTotalStaked(): Promise<BigIntString> {
    const cacheKey = `${this.cacheKeyPrefix}total-staked`;
    const cached = globalCache.get<BigIntString>(cacheKey);
    if (cached) return cached;

    try {
      const total = await this.fetchTotalStaked();
      globalCache.set(cacheKey, total, this.cacheTtl);
      return total;
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(`Failed to get total staked: ${error.message}`, {
          network: this.getNetworkType(),
        });
      }
      return '0' as BigIntString;
    }
  }

  /**
   * Invalidate stake cache
   */
  invalidateCache(holder?: Principal): void {
    if (holder) {
      globalCache.delete(`${this.cacheKeyPrefix}balance:${holder}`);
    } else {
      globalCache.invalidatePattern(new RegExp(`^${this.cacheKeyPrefix}`));
    }
  }

  private async fetchBalanceFromChain(
    _holder: Principal
  ): Promise<BigIntString | null> {
    // Placeholder for actual chain interaction
    return null;
  }

  private async fetchHoldersFromChain(
    _options: StakeListOptions
  ): Promise<StakeBalance[]> {
    // Placeholder for actual chain interaction
    return [];
  }

  private async fetchTotalStaked(): Promise<BigIntString> {
    // Placeholder for actual chain interaction
    return '0' as BigIntString;
  }
}
