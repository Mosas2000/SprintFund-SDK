import { describe, it, expect } from 'vitest';
import {
  isPrincipal,
  isBigIntString,
  isStacksAddress,
  isProposal,
  isVote,
  isStakeBalance,
  type Proposal,
} from '../src/types/contract.js';
import { toBigIntString, toStacksAddress, toPrincipal } from '../src/types/index.js';

describe('Type Guards', () => {
  describe('isPrincipal', () => {
    it('should recognize valid principals', () => {
      expect(isPrincipal('SP1234567890123456789012345678901234ABC')).toBe(true);
      expect(isPrincipal('SN1234567890123456789012345678901234ABC')).toBe(true);
    });

    it('should recognize contract principals', () => {
      expect(
        isPrincipal('SP1234567890123456789012345678901234ABC.contract-name')
      ).toBe(true);
    });

    it('should reject invalid principals', () => {
      expect(isPrincipal('INVALID')).toBe(false);
      expect(isPrincipal('')).toBe(false);
      expect(isPrincipal(123)).toBe(false);
    });
  });

  describe('isBigIntString', () => {
    it('should recognize valid big int strings', () => {
      expect(isBigIntString('0')).toBe(true);
      expect(isBigIntString('123456789')).toBe(true);
      expect(isBigIntString('999999999999999999')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isBigIntString('-123')).toBe(false);
      expect(isBigIntString('123.45')).toBe(false);
      expect(isBigIntString('0x123')).toBe(false);
      expect(isBigIntString('abc')).toBe(false);
    });
  });

  describe('isStacksAddress', () => {
    it('should recognize valid addresses', () => {
      expect(isStacksAddress('SP1234567890123456789012345678901234ABC')).toBe(
        true
      );
    });

    it('should reject contract principals', () => {
      expect(
        isStacksAddress('SP1234567890123456789012345678901234ABC.contract')
      ).toBe(false);
    });
  });

  describe('isProposal', () => {
    it('should recognize valid proposals', () => {
      const proposal: Proposal = {
        id: toBigIntString(1),
        title: 'Test',
        description: 'Test proposal',
        proposer: toPrincipal(
          'SP1234567890123456789012345678901234ABC'
        ),
        createdAt: Date.now(),
        endsAt: Date.now() + 86400000,
        fundingGoal: toBigIntString(1000000),
        fundingRaised: toBigIntString(0),
        status: 'ACTIVE',
      };

      expect(isProposal(proposal)).toBe(true);
    });

    it('should reject incomplete objects', () => {
      expect(isProposal({ id: '1' })).toBe(false);
      expect(isProposal({})).toBe(false);
      expect(isProposal(null)).toBe(false);
    });
  });

  describe('isVote', () => {
    it('should recognize valid votes', () => {
      const vote = {
        proposalId: toBigIntString(1),
        voter: toPrincipal('SP1234567890123456789012345678901234ABC'),
        direction: 'FOR',
        weight: toBigIntString(5),
        votedAt: Date.now(),
        blockHeight: 100000,
      };

      expect(isVote(vote)).toBe(true);
    });

    it('should reject incomplete votes', () => {
      expect(isVote({ proposalId: '1' })).toBe(false);
      expect(isVote({})).toBe(false);
    });
  });

  describe('isStakeBalance', () => {
    it('should recognize valid stake balances', () => {
      const stake = {
        holder: toPrincipal('SP1234567890123456789012345678901234ABC'),
        balance: toBigIntString(1000000),
        stakedAt: Date.now(),
        blockHeight: 100000,
      };

      expect(isStakeBalance(stake)).toBe(true);
    });

    it('should reject invalid data', () => {
      expect(isStakeBalance({ holder: 'INVALID' })).toBe(false);
      expect(isStakeBalance(null)).toBe(false);
    });
  });
});
