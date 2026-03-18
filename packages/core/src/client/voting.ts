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
import { isVote } from '../types/contract.js';
import { throwNetworkError } from '../errors/network.js';
import { calculateVoteCost } from '../math/quadratic.js';

/**
 * Client for voting-related contract operations
 */
export class VotingClient extends BaseClient {
  private readonly cacheKeyPrefix = 'voting:';
  private readonly votingPowerTtl = 60000; // 1 minute TTL for voting power (can change frequently)

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
        globalCache.set(cacheKey, power, this.votingPowerTtl);
      }
      return power;
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(`Failed to fetch voting power for ${voter}: ${error.message}`, {
          voter,
          network: this.getNetworkType(),
        });
      }
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
      if (Array.isArray(votes) && votes.every(isVote)) {
        globalCache.set(cacheKey, votes, 5 * 60000); // 5 minute TTL
      }
      return votes;
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(
          `Failed to fetch votes for proposal ${options.proposalId}: ${error.message}`,
          {
            proposalId: options.proposalId,
            network: this.getNetworkType(),
          }
        );
      }
      return [];
    }
  }

  /**
   * Get vote count on a proposal
   */
  async getVoteCount(proposalId: BigIntString): Promise<number> {
    const cacheKey = `${this.cacheKeyPrefix}count:${proposalId}`;
    const cached = globalCache.get<number>(cacheKey);
    if (cached) return cached;

    try {
      const count = await this.fetchVoteCount(proposalId);
      globalCache.set(cacheKey, count, 5 * 60000);
      return count;
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(
          `Failed to get vote count for proposal: ${error.message}`,
          { proposalId, network: this.getNetworkType() }
        );
      }
      return 0;
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
        cost: calculateVoteCost(weight),
        maxWeight: power.maxWeight,
        remainingCapacity: power.available,
      };
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(`Failed to estimate vote cost: ${error.message}`, {
          voter,
          weight,
        });
      }
      return null;
    }
  }

  /**
   * Invalidate voting cache
   */
  invalidateCache(voter?: Principal, proposalId?: BigIntString): void {
    if (voter && proposalId) {
      globalCache.delete(`${this.cacheKeyPrefix}power:${voter}`);
      globalCache.delete(`${this.cacheKeyPrefix}proposal:${proposalId}:*`);
    } else if (voter) {
      globalCache.delete(`${this.cacheKeyPrefix}power:${voter}`);
    } else if (proposalId) {
      globalCache.invalidatePattern(
        new RegExp(`^${this.cacheKeyPrefix}.*${proposalId}`)
      );
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

  private async fetchVoteCount(_proposalId: BigIntString): Promise<number> {
    // Placeholder for actual chain interaction
    return 0;
  }
}
