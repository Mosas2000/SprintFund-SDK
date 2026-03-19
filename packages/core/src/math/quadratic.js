import { toBigIntString } from '../types/index.js';
/**
 * Quadratic voting mathematics
 * Cost = weight^2
 * Max weight = sqrt(stake)
 */
/**
 * Calculate the cost (in voting power used) for a vote of given weight
 */
export function calculateVoteCost(weight) {
    const w = BigInt(weight);
    const cost = w * w;
    return toBigIntString(cost);
}
/**
 * Calculate maximum voting weight from stake balance
 * maxWeight = floor(sqrt(stakeBalance))
 */
export function calculateMaxWeight(stake) {
    const s = BigInt(stake);
    if (s === BigInt(0)) {
        return toBigIntString(0);
    }
    let maxWeight = BigInt(1);
    let high = s;
    let low = BigInt(1);
    // Binary search for integer square root
    while (low <= high) {
        const mid = (low + high) / BigInt(2);
        const square = mid * mid;
        if (square === s) {
            return toBigIntString(mid);
        }
        else if (square < s) {
            maxWeight = mid;
            low = mid + BigInt(1);
        }
        else {
            high = mid - BigInt(1);
        }
    }
    return toBigIntString(maxWeight);
}
/**
 * Calculate remaining voting power after casting votes
 */
export function calculateRemainingPower(maxWeight, usedWeight) {
    const max = BigInt(maxWeight);
    const used = BigInt(usedWeight);
    const remaining = max - used;
    return toBigIntString(remaining >= BigInt(0) ? remaining : BigInt(0));
}
/**
 * Check if a vote weight is valid for given stake
 */
export function isValidVoteWeight(weight, stake) {
    const maxWeight = calculateMaxWeight(stake);
    return BigInt(weight) <= BigInt(maxWeight);
}
/**
 * Calculate voting efficiency (lower is more efficient due to quadratic formula)
 */
export function getVotingEfficiency(weight) {
    const cost = calculateVoteCost(weight);
    const costPerWeight = BigInt(cost) / BigInt(weight);
    return costPerWeight.toString();
}
/**
 * Calculate maximum votes possible with given stake
 */
export function getMaxVotes(stake) {
    const maxWeight = calculateMaxWeight(stake);
    // Approximation: with quadratic voting, you can cast ~sqrt(stake) votes
    // This is a rough estimate for user-friendly displays
    const estimate = Math.floor(Math.sqrt(Number(maxWeight)));
    return Math.max(1, estimate);
}
//# sourceMappingURL=quadratic.js.map