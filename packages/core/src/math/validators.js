import { ValidationError } from '../errors/validation.js';
import { calculateMaxWeight, calculateVoteCost } from './quadratic.js';
/**
 * Validate vote parameters
 */
export function validateVoteParameters(weight, stake) {
    if (!weight || !stake) {
        throw new ValidationError('Weight and stake must be provided');
    }
    const w = BigInt(weight);
    const s = BigInt(stake);
    if (w <= BigInt(0)) {
        throw new ValidationError('Vote weight must be positive', {
            field: 'weight',
            value: weight,
        });
    }
    if (s <= BigInt(0)) {
        throw new ValidationError('Stake must be positive', {
            field: 'stake',
            value: stake,
        });
    }
    const maxWeight = calculateMaxWeight(stake);
    if (w > BigInt(maxWeight)) {
        throw new ValidationError('Vote weight exceeds maximum allowed', {
            field: 'weight',
            value: weight,
            maxWeight,
            stake,
        });
    }
}
/**
 * Validate proposal parameters
 */
export function validateProposalParameters(fundingGoal, durationBlocks) {
    const goal = BigInt(fundingGoal);
    if (goal <= BigInt(0)) {
        throw new ValidationError('Funding goal must be positive', {
            field: 'fundingGoal',
            value: fundingGoal,
        });
    }
    if (durationBlocks <= 0) {
        throw new ValidationError('Duration must be positive', {
            field: 'durationBlocks',
            value: durationBlocks,
        });
    }
    // Typical constraints
    if (durationBlocks > 100000) {
        throw new ValidationError('Duration exceeds maximum allowed', {
            field: 'durationBlocks',
            maxValue: 100000,
        });
    }
}
/**
 * Validate stake transaction parameters
 */
export function validateStakeTransaction(amount) {
    const a = BigInt(amount);
    if (a <= BigInt(0)) {
        throw new ValidationError('Stake amount must be positive', {
            field: 'amount',
            value: amount,
        });
    }
    // Typical minimum stake
    const minStake = BigInt(1000000); // 1 STX in microSTX
    if (a < minStake) {
        throw new ValidationError('Stake amount below minimum', {
            field: 'amount',
            value: amount,
            minimum: minStake.toString(),
        });
    }
}
/**
 * Estimate total voting cost for given votes
 */
export function estimateTotalVotingCost(votes) {
    const total = votes.reduce((sum, vote) => {
        return sum + BigInt(calculateVoteCost(vote));
    }, BigInt(0));
    return total.toString();
}
//# sourceMappingURL=validators.js.map