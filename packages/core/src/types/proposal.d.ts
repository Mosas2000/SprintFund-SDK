import { BigIntString, Principal } from './index.js';
/**
 * Proposal data model for SprintFund governance
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
    status: ProposalStatus;
    metadata?: Record<string, unknown>;
}
/**
 * Proposal status enum
 */
export declare enum ProposalStatus {
    ACTIVE = "ACTIVE",
    ENDED = "ENDED",
    EXECUTED = "EXECUTED",
    CANCELLED = "CANCELLED"
}
/**
 * Proposal creation parameters
 */
export interface CreateProposalParams {
    title: string;
    description: string;
    fundingGoal: BigIntString;
    durationBlocks: number;
    metadata?: Record<string, unknown>;
}
/**
 * Proposal result data
 */
export interface ProposalResult {
    proposalId: BigIntString;
    forVotes: BigIntString;
    againstVotes: BigIntString;
    abstainVotes: BigIntString;
    executed: boolean;
    executedAt?: number;
}
export interface ProposalListOptions {
    limit: number;
    offset: number;
    status?: ProposalStatus;
}
//# sourceMappingURL=proposal.d.ts.map