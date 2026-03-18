import { BaseClient } from './base.js';
import {
  Vote,
  VoteDirection,
  VotingPower,
  VoteEstimate,
  VoteListOptions,
} from '../types/voting.js';
import { BigIntString, Principal } from '../types/index.js';
import { globalCache } from '../utils/cache.js';
import { validateAddress } from '../errors/validation.js';
import { NetworkType } from '../types/index.js';

/**
 * Client for voting-related contract operations
 */
export class VotingClient extends BaseClient {
  private readonly cacheKeyPrefix = 'voting:';

  constructor(networkType: NetworkType = 'mainnet') {
    super(networkType);
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(voter: Principal): Promise<VotingPower | null> {
    const cacheKey = `${this.cacheKeyPrefix}power:${voter}`;
    const cached = globalCache.get<VotingPower>(cacheKey);
    if (cached) return cached;

    try {
      validateAddress(voter as string);
      const power = await this.fetchVotingPowerFromChain(voter);
      if (power) {
        globalCache.set(cacheKey, power, 60000); // 1 minute TTL for power
      }
      return power;
    } catch {
      return null;
    }
  }

  /**
   * Get votes on a proposal
   */
  async getVotes(options: VoteListOptions): Promise<Vote[]> {
    const cacheKey = `${this.cacheKeyPrefix}proposal:${options.proposalId}:${options.limit}:${options.offset}`;
    const cached = globalCache.get<Vote[]>(cacheKey);
    if (cached) return cached;

    try {
      const votes = await this.fetchVotesFromChain(options);
      globalCache.set(cacheKey, votes);
      return votes;
    } catch {
      return [];
    }
  }

  /**
   * Estimate vote cost for a given weight
   */
  async estimateVoteCost(
    voter: Principal,
    weight: BigIntString
  ): Promise<VoteEstimate | null> {
    try {
      const power = await this.getVotingPower(voter);
      if (!power) return null;

      return {
        weight,
        cost: this.calculateVoteCost(weight),
        maxWeight: power.maxWeight,
        remainingCapacity: power.available,
      };
    } catch {
      return null;
    }
  }

  /**
   * Calculate quadratic voting cost
   */
  private calculateVoteCost(weight: BigIntString): BigIntString {
    // Cost = weight^2
    const w = BigInt(weight);
    const cost = w * w;
    return cost.toString() as BigIntString;
  }

  /**
   * Invalidate voting cache
   */
  invalidateCache(voter?: Principal): void {
    if (voter) {
      globalCache.delete(`${this.cacheKeyPrefix}power:${voter}`);
    } else {
      globalCache.invalidatePattern(new RegExp(`^${this.cacheKeyPrefix}`));
    }
  }

  private async fetchVotingPowerFromChain(
    _voter: Principal
  ): Promise<VotingPower | null> {
    // Placeholder for actual chain interaction
    return null;
  }

  private async fetchVotesFromChain(_options: VoteListOptions): Promise<Vote[]> {
    // Placeholder for actual chain interaction
    return [];
  }
}
