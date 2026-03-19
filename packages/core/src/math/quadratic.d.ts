import { BigIntString } from '../types/index.js';
/**
 * Quadratic voting mathematics
 * Cost = weight^2
 * Max weight = sqrt(stake)
 */
/**
 * Calculate the cost (in voting power used) for a vote of given weight
 */
export declare function calculateVoteCost(weight: BigIntString): BigIntString;
/**
 * Calculate maximum voting weight from stake balance
 * maxWeight = floor(sqrt(stakeBalance))
 */
export declare function calculateMaxWeight(stake: BigIntString): BigIntString;
/**
 * Calculate remaining voting power after casting votes
 */
export declare function calculateRemainingPower(maxWeight: BigIntString, usedWeight: BigIntString): BigIntString;
/**
 * Check if a vote weight is valid for given stake
 */
export declare function isValidVoteWeight(weight: BigIntString, stake: BigIntString): boolean;
/**
 * Calculate voting efficiency (lower is more efficient due to quadratic formula)
 */
export declare function getVotingEfficiency(weight: BigIntString): string;
/**
 * Calculate maximum votes possible with given stake
 */
export declare function getMaxVotes(stake: BigIntString): number;
//# sourceMappingURL=quadratic.d.ts.map