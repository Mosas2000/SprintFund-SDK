import { BigIntString } from '../types/index.js';
/**
 * Validate vote parameters
 */
export declare function validateVoteParameters(weight: BigIntString, stake: BigIntString): void;
/**
 * Validate proposal parameters
 */
export declare function validateProposalParameters(fundingGoal: BigIntString, durationBlocks: number): void;
/**
 * Validate stake transaction parameters
 */
export declare function validateStakeTransaction(amount: BigIntString): void;
/**
 * Estimate total voting cost for given votes
 */
export declare function estimateTotalVotingCost(votes: BigIntString[]): BigIntString;
//# sourceMappingURL=validators.d.ts.map