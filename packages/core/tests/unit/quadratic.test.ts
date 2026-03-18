import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateVoteCost,
  calculateMaxWeight,
  calculateRemainingPower,
  isValidVoteWeight,
  getMaxVotes,
} from '../src/math/quadratic.js';
import { toBigIntString } from '../src/types/index.js';

describe('Quadratic Voting Math', () => {
  describe('calculateVoteCost', () => {
    it('should calculate cost as weight squared', () => {
      const weight = toBigIntString(5);
      const cost = calculateVoteCost(weight);
      expect(cost).toBe('25');
    });

    it('should handle zero weight', () => {
      const weight = toBigIntString(0);
      const cost = calculateVoteCost(weight);
      expect(cost).toBe('0');
    });

    it('should handle large weights', () => {
      const weight = toBigIntString(1000000);
      const cost = calculateVoteCost(weight);
      expect(cost).toBe('1000000000000');
    });
  });

  describe('calculateMaxWeight', () => {
    it('should calculate integer square root', () => {
      const stake = toBigIntString(100);
      const maxWeight = calculateMaxWeight(stake);
      expect(maxWeight).toBe('10');
    });

    it('should handle zero stake', () => {
      const stake = toBigIntString(0);
      const maxWeight = calculateMaxWeight(stake);
      expect(maxWeight).toBe('0');
    });

    it('should handle perfect squares', () => {
      const stake = toBigIntString(144);
      const maxWeight = calculateMaxWeight(stake);
      expect(maxWeight).toBe('12');
    });

    it('should floor non-perfect squares', () => {
      const stake = toBigIntString(99);
      const maxWeight = calculateMaxWeight(stake);
      expect(maxWeight).toBe('9');
    });

    it('should handle large stakes', () => {
      const stake = toBigIntString(1000000000);
      const maxWeight = calculateMaxWeight(stake);
      expect(maxWeight).toBe('31622');
    });
  });

  describe('calculateRemainingPower', () => {
    it('should calculate remaining power', () => {
      const maxWeight = toBigIntString(10);
      const usedWeight = toBigIntString(3);
      const remaining = calculateRemainingPower(maxWeight, usedWeight);
      expect(remaining).toBe('7');
    });

    it('should return zero if all power used', () => {
      const maxWeight = toBigIntString(10);
      const usedWeight = toBigIntString(10);
      const remaining = calculateRemainingPower(maxWeight, usedWeight);
      expect(remaining).toBe('0');
    });

    it('should return zero if power exceeded', () => {
      const maxWeight = toBigIntString(5);
      const usedWeight = toBigIntString(10);
      const remaining = calculateRemainingPower(maxWeight, usedWeight);
      expect(remaining).toBe('0');
    });
  });

  describe('isValidVoteWeight', () => {
    it('should validate weight within limits', () => {
      const weight = toBigIntString(5);
      const stake = toBigIntString(100);
      expect(isValidVoteWeight(weight, stake)).toBe(true);
    });

    it('should reject weight exceeding limits', () => {
      const weight = toBigIntString(20);
      const stake = toBigIntString(100);
      expect(isValidVoteWeight(weight, stake)).toBe(false);
    });

    it('should accept max weight', () => {
      const weight = toBigIntString(10);
      const stake = toBigIntString(100);
      expect(isValidVoteWeight(weight, stake)).toBe(true);
    });

    it('should reject zero weight', () => {
      const weight = toBigIntString(0);
      const stake = toBigIntString(100);
      expect(isValidVoteWeight(weight, stake)).toBe(false);
    });
  });

  describe('getMaxVotes', () => {
    it('should estimate max votes from stake', () => {
      const stake = toBigIntString(10000);
      const maxVotes = getMaxVotes(stake);
      expect(maxVotes).toBeGreaterThan(0);
      expect(maxVotes).toBeLessThanOrEqual(100);
    });

    it('should return at least 1 for any stake', () => {
      const stake = toBigIntString(1);
      const maxVotes = getMaxVotes(stake);
      expect(maxVotes).toBeGreaterThanOrEqual(1);
    });
  });
});
