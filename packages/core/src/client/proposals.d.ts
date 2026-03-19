import { BaseClient } from './base.js';
import { Proposal, ProposalListOptions } from '../types/proposal.js';
import { BigIntString } from '../types/index.js';
import { NetworkType } from '../types/index.js';
/**
 * Client for proposal-related contract operations
 */
export declare class ProposalClient extends BaseClient {
    private readonly cacheKeyPrefix;
    private readonly cacheTtl;
    constructor(networkType?: NetworkType);
    /**
     * Fetch a single proposal by ID
     */
    getProposal(proposalId: BigIntString): Promise<Proposal | null>;
    /**
     * List proposals with pagination
     */
    listProposals(options: ProposalListOptions): Promise<Proposal[]>;
    /**
     * Get active proposals
     */
    getActiveProposals(limit?: number): Promise<Proposal[]>;
    /**
     * Get total proposal count
     */
    getProposalCount(): Promise<BigIntString>;
    /**
     * Invalidate proposal cache
     */
    invalidateCache(proposalId?: BigIntString): void;
    private fetchProposalFromChain;
    private fetchProposalsFromChain;
    private fetchProposalCount;
}
//# sourceMappingURL=proposals.d.ts.map