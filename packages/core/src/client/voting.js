import { BaseClient } from './base.js';
import { globalCache } from '../utils/cache.js';
import { validateAddress } from '../errors/validation.js';
import { isVote } from '../types/contract.js';
import { throwNetworkError } from '../errors/network.js';
import { calculateVoteCost } from '../math/quadratic.js';
/**
 * Client for voting-related contract operations
 */
export class VotingClient extends BaseClient {
    constructor(networkType = 'mainnet') {
        super(networkType);
        this.cacheKeyPrefix = 'voting:';
        this.votingPowerTtl = 60000; // 1 minute TTL for voting power (can change frequently)
    }
    /**
     * Get voting power for an address
     */
    async getVotingPower(voter) {
        const cacheKey = `${this.cacheKeyPrefix}power:${voter}`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            validateAddress(voter);
            const power = await this.fetchVotingPowerFromChain(voter);
            if (power) {
                globalCache.set(cacheKey, power, this.votingPowerTtl);
            }
            return power;
        }
        catch (error) {
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
    async getVotes(options) {
        const cacheKey = `${this.cacheKeyPrefix}proposal:${options.proposalId}:${options.limit}:${options.offset}`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            const votes = await this.fetchVotesFromChain(options);
            if (Array.isArray(votes) && votes.every(isVote)) {
                globalCache.set(cacheKey, votes, 5 * 60000); // 5 minute TTL
            }
            return votes;
        }
        catch (error) {
            if (error instanceof Error) {
                throwNetworkError(`Failed to fetch votes for proposal ${options.proposalId}: ${error.message}`, {
                    proposalId: options.proposalId,
                    network: this.getNetworkType(),
                });
            }
            return [];
        }
    }
    /**
     * Get vote count on a proposal
     */
    async getVoteCount(proposalId) {
        const cacheKey = `${this.cacheKeyPrefix}count:${proposalId}`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            const count = await this.fetchVoteCount(proposalId);
            globalCache.set(cacheKey, count, 5 * 60000);
            return count;
        }
        catch (error) {
            if (error instanceof Error) {
                throwNetworkError(`Failed to get vote count for proposal: ${error.message}`, { proposalId, network: this.getNetworkType() });
            }
            return 0;
        }
    }
    /**
     * Estimate vote cost for a given weight
     */
    async estimateVoteCost(voter, weight) {
        try {
            const power = await this.getVotingPower(voter);
            if (!power)
                return null;
            return {
                weight,
                cost: calculateVoteCost(weight),
                maxWeight: power.maxWeight,
                remainingCapacity: power.available,
            };
        }
        catch (error) {
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
    invalidateCache(voter, proposalId) {
        if (voter && proposalId) {
            globalCache.delete(`${this.cacheKeyPrefix}power:${voter}`);
            globalCache.delete(`${this.cacheKeyPrefix}proposal:${proposalId}:*`);
        }
        else if (voter) {
            globalCache.delete(`${this.cacheKeyPrefix}power:${voter}`);
        }
        else if (proposalId) {
            globalCache.invalidatePattern(new RegExp(`^${this.cacheKeyPrefix}.*${proposalId}`));
        }
        else {
            globalCache.invalidatePattern(new RegExp(`^${this.cacheKeyPrefix}`));
        }
    }
    async fetchVotingPowerFromChain(_voter) {
        // Placeholder for actual chain interaction
        return null;
    }
    async fetchVotesFromChain(_options) {
        // Placeholder for actual chain interaction
        return [];
    }
    async fetchVoteCount(_proposalId) {
        // Placeholder for actual chain interaction
        return 0;
    }
}
//# sourceMappingURL=voting.js.map