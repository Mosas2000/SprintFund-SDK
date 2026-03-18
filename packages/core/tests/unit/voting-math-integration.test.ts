import { describe, it, expect } from 'vitest';
import {
  calculateVoteCost,
  calculateMaxWeight,
  calculateRemainingPower,
  isValidVoteWeight,
  getVotingEfficiency,
  getMaxVotes,
} from '../src/math/quadratic.js';
import { toBigIntString } from '../src/types/index.js';

describe('Quadratic Voting Integration', () => {
  describe('Realistic voting scenarios', () => {
    it('should handle multi-vote scenario with cumulative costs', () => {
      const stake = toBigIntString(10000);
      const maxWeight = calculateMaxWeight(stake);
      expect(BigInt(maxWeight)).toBeGreaterThan(BigInt(0));

      // Simulate voting with weights: 2, 3, 1
      const weight1 = toBigIntString(2);
      const cost1 = calculateVoteCost(weight1);
      expect(cost1).toBe('4');

      const weight2 = toBigIntString(3);
      const cost2 = calculateVoteCost(weight2);
      expect(cost2).toBe('9');

      const weight3 = toBigIntString(1);
      const cost3 = calculateVoteCost(weight3);
      expect(cost3).toBe('1');

      const totalCost = BigInt(cost1) + BigInt(cost2) + BigInt(cost3);
      expect(totalCost).toBe(BigInt(14));
    });

    it('should restrict voting power for small stakes', () => {
      const smallStake = toBigIntString(10);
      const maxWeight = calculateMaxWeight(smallStake);

      // sqrt(10) ≈ 3.16, floored to 3
      expect(BigInt(maxWeight)).toBeLessThanOrEqual(BigInt(4));
      expect(BigInt(maxWeight)).toBeGreaterThan(BigInt(0));
    });

    it('should enable meaningful voting power for large stakes', () => {
      const largeStake = toBigIntString(1000000);
      const maxWeight = calculateMaxWeight(largeStake);

      // sqrt(1000000) = 1000
      expect(BigInt(maxWeight)).toBe(BigInt(1000));
    });

    it('should show quadratic efficiency - more weight is progressively expensive', () => {
      const smallVote = toBigIntString(1);
      const smallCost = BigInt(calculateVoteCost(smallVote));

      const largeVote = toBigIntString(10);
      const largeCost = BigInt(calculateVoteCost(largeVote));

      // 1^2 = 1, 10^2 = 100
      // Cost grows quadratically
      expect(largeCost / smallCost).toBeGreaterThan(BigInt(9));
    });

    it('should track remaining capacity through multiple votes', () => {
      const stake = toBigIntString(100);
      const maxWeight = calculateMaxWeight(stake); // 10

      let remaining = maxWeight;
      const votes = [toBigIntString(2), toBigIntString(3)];

      for (const vote of votes) {
        remaining = calculateRemainingPower(
          maxWeight,
          toBigIntString(BigInt(maxWeight) - BigInt(remaining))
        );
      }

      // Used: 2 + 3 = 5, Remaining: 10 - 5 = 5
      expect(BigInt(remaining)).toBe(BigInt(5));
    });
  });

  describe('Edge cases and boundaries', () => {
    it('should handle single STX stake correctly', () => {
      const minStake = toBigIntString(1000000); // 1 STX in microSTX
      const maxWeight = calculateMaxWeight(minStake);
      expect(BigInt(maxWeight)).toBeGreaterThan(BigInt(0));
    });

    it('should handle very large stakes', () => {
      const hugeStake = toBigIntString('1000000000000000000'); // 10^18
      const maxWeight = calculateMaxWeight(hugeStake);
      expect(BigInt(maxWeight)).toBeGreaterThan(BigInt(1000000000));
    });

    it('should validate weight constraints correctly', () => {
      const stake = toBigIntString(100);
      const maxWeight = calculateMaxWeight(stake);

      // At max weight - valid
      expect(isValidVoteWeight(maxWeight, stake)).toBe(true);

      // Just over max weight - invalid
      const overWeight = toBigIntString(BigInt(maxWeight) + BigInt(1));
      expect(isValidVoteWeight(overWeight, stake)).toBe(false);
    });
  });

  describe('Voting efficiency and recommendations', () => {
    it('should calculate efficiency metrics for display', () => {
      const weight1 = toBigIntString(1);
      const weight5 = toBigIntString(5);
      const weight10 = toBigIntString(10);

      const eff1 = getVotingEfficiency(weight1); // 1/1 = 1
      const eff5 = getVotingEfficiency(weight5); // 25/5 = 5
      const eff10 = getVotingEfficiency(weight10); // 100/10 = 10

      expect(BigInt(eff1)).toBeLessThan(BigInt(eff5));
      expect(BigInt(eff5)).toBeLessThan(BigInt(eff10));
    });

    it('should recommend appropriate vote counts', () => {
      const smallStake = toBigIntString(100);
      const largeStake = toBigIntString(10000);

      const smallMaxVotes = getMaxVotes(smallStake);
      const largeMaxVotes = getMaxVotes(largeStake);

      expect(largeMaxVotes).toBeGreaterThan(smallMaxVotes);
      expect(smallMaxVotes).toBeGreaterThanOrEqual(1);
    });
  });
});
