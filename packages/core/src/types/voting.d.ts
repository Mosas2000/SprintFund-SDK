import { BigIntString, Principal } from './index.js';
/**
 * Vote direction options
 */
export declare enum VoteDirection {
    FOR = "FOR",
    AGAINST = "AGAINST",
    ABSTAIN = "ABSTAIN"
}
/**
 * Vote data model
 */
export interface Vote {
    proposalId: BigIntString;
    voter: Principal;
    direction: VoteDirection;
    weight: BigIntString;
    votedAt: number;
    blockHeight: number;
}
/**
 * Vote submission parameters
 */
export interface SubmitVoteParams {
    proposalId: BigIntString;
    direction: VoteDirection;
    weight: BigIntString;
}
/**
 * Voting power calculation
 */
export interface VotingPower {
    maxWeight: BigIntString;
    currentUsed: BigIntString;
    available: BigIntString;
    stakeBalance: BigIntString;
}
/**
 * Vote estimate for cost calculation
 */
export interface VoteEstimate {
    weight: BigIntString;
    cost: BigIntString;
    maxWeight: BigIntString;
    remainingCapacity: BigIntString;
}
/**
 * Voter data
 */
export interface Voter {
    address: Principal;
    totalVotes: BigIntString;
    distinctProposals: number;
    averageWeight: BigIntString;
}
export interface VoteListOptions {
    proposalId: BigIntString;
    limit: number;
    offset: number;
}
//# sourceMappingURL=voting.d.ts.map