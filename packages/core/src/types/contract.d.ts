import { Principal, BigIntString } from './index.js';
/**
 * Type guards for runtime type checking
 */
export declare function isPrincipal(value: unknown): value is Principal;
export declare function isBigIntString(value: unknown): value is BigIntString;
export declare function isStacksAddress(value: unknown): value is string;
export declare function isProposal(value: unknown): value is Proposal;
export declare function isVote(value: unknown): value is Vote;
export declare function isStakeBalance(value: unknown): value is StakeBalance;
/**
 * Contract type from Clarity
 */
export interface Proposal {
    id: BigIntString;
    title: string;
    description: string;
    proposer: Principal;
    createdAt: number;
    endsAt: number;
    fundingGoal: BigIntString;
    fundingRaised: BigIntString;
    status: string;
    metadata?: Record<string, unknown>;
}
export interface Vote {
    proposalId: BigIntString;
    voter: Principal;
    direction: string;
    weight: BigIntString;
    votedAt: number;
    blockHeight: number;
}
export interface StakeBalance {
    holder: Principal;
    balance: BigIntString;
    stakedAt: number;
    blockHeight: number;
}
export interface VotingPower {
    maxWeight: BigIntString;
    currentUsed: BigIntString;
    available: BigIntString;
    stakeBalance: BigIntString;
}
//# sourceMappingURL=contract.d.ts.map