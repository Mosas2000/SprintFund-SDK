import { BaseClient } from './base.js';
import { Vote, VotingPower, VoteEstimate, VoteListOptions } from '../types/voting.js';
import { BigIntString, Principal } from '../types/index.js';
import { NetworkType } from '../types/index.js';
/**
 * Client for voting-related contract operations
 */
export declare class VotingClient extends BaseClient {
    private readonly cacheKeyPrefix;
    private readonly votingPowerTtl;
    constructor(networkType?: NetworkType);
    /**
     * Get voting power for an address
     */
    getVotingPower(voter: Principal): Promise<VotingPower | null>;
    /**
     * Get votes on a proposal
     */
    getVotes(options: VoteListOptions): Promise<Vote[]>;
    /**
     * Get vote count on a proposal
     */
    getVoteCount(proposalId: BigIntString): Promise<number>;
    /**
     * Estimate vote cost for a given weight
     */
    estimateVoteCost(voter: Principal, weight: BigIntString): Promise<VoteEstimate | null>;
    /**
     * Invalidate voting cache
     */
    invalidateCache(voter?: Principal, proposalId?: BigIntString): void;
    private fetchVotingPowerFromChain;
    private fetchVotesFromChain;
    private fetchVoteCount;
}
//# sourceMappingURL=voting.d.ts.map