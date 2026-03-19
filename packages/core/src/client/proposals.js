import { BaseClient } from './base.js';
import { ProposalStatus, } from '../types/proposal.js';
import { toBigIntString } from '../types/index.js';
import { globalCache } from '../utils/cache.js';
import { isProposal } from '../types/contract.js';
import { throwNetworkError } from '../errors/network.js';
/**
 * Client for proposal-related contract operations
 */
export class ProposalClient extends BaseClient {
    constructor(networkType = 'mainnet') {
        super(networkType);
        this.cacheKeyPrefix = 'proposals:';
        this.cacheTtl = 5 * 60 * 1000; // 5 minutes
    }
    /**
     * Fetch a single proposal by ID
     */
    async getProposal(proposalId) {
        const cacheKey = `${this.cacheKeyPrefix}${proposalId}`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            const proposal = await this.fetchProposalFromChain(proposalId);
            if (proposal && isProposal(proposal)) {
                globalCache.set(cacheKey, proposal, this.cacheTtl);
            }
            return proposal;
        }
        catch (error) {
            if (error instanceof Error) {
                throwNetworkError(`Failed to fetch proposal ${proposalId}: ${error.message}`, {
                    proposalId,
                    network: this.getNetworkType(),
                });
            }
            return null;
        }
    }
    /**
     * List proposals with pagination
     */
    async listProposals(options) {
        const cacheKey = `${this.cacheKeyPrefix}list:${options.limit}:${options.offset}:${options.status || 'all'}`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            const proposals = await this.fetchProposalsFromChain(options);
            if (Array.isArray(proposals) && proposals.every(isProposal)) {
                globalCache.set(cacheKey, proposals, this.cacheTtl);
            }
            return proposals;
        }
        catch (error) {
            if (error instanceof Error) {
                throwNetworkError(`Failed to list proposals: ${error.message}`, {
                    limit: options.limit,
                    offset: options.offset,
                    network: this.getNetworkType(),
                });
            }
            return [];
        }
    }
    /**
     * Get active proposals
     */
    async getActiveProposals(limit = 10) {
        return this.listProposals({
            limit,
            offset: 0,
            status: ProposalStatus.ACTIVE,
        });
    }
    /**
     * Get total proposal count
     */
    async getProposalCount() {
        const cacheKey = `${this.cacheKeyPrefix}total-count`;
        const cached = globalCache.get(cacheKey);
        if (cached)
            return cached;
        try {
            const count = await this.fetchProposalCount();
            globalCache.set(cacheKey, count, this.cacheTtl);
            return count;
        }
        catch (error) {
            if (error instanceof Error) {
                throwNetworkError(`Failed to get proposal count: ${error.message}`, {
                    network: this.getNetworkType(),
                });
            }
            return toBigIntString(0);
        }
    }
    /**
     * Invalidate proposal cache
     */
    invalidateCache(proposalId) {
        if (proposalId) {
            globalCache.delete(`${this.cacheKeyPrefix}${proposalId}`);
        }
        else {
            globalCache.invalidatePattern(new RegExp(`^${this.cacheKeyPrefix}`));
        }
    }
    async fetchProposalFromChain(_proposalId) {
        // Placeholder for actual chain interaction
        // Would call Stacks API or use library like @stacks/transactions
        return null;
    }
    async fetchProposalsFromChain(_options) {
        // Placeholder for actual chain interaction
        return [];
    }
    async fetchProposalCount() {
        // Placeholder for actual chain interaction
        return toBigIntString(0);
    }
}
//# sourceMappingURL=proposals.js.map