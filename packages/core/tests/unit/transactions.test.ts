import { describe, it, expect } from 'vitest';
import { TransactionClient } from '../src/client/transactions.js';
import { toBigIntString } from '../src/types/index.js';

describe('Transaction Builder', () => {
  let client: TransactionClient;

  beforeEach(() => {
    client = new TransactionClient('mainnet');
  });

  describe('Stake transactions', () => {
    it('should validate valid stake amount', async () => {
      const tx = await client.buildStakeTransaction(toBigIntString(10000000));
      expect(tx.type).toBe('stake');
      expect(tx.isValid).toBe(true);
      expect(tx.errors).toHaveLength(0);
    });

    it('should reject zero amount', async () => {
      const tx = await client.buildStakeTransaction(toBigIntString(0));
      expect(tx.isValid).toBe(false);
      expect(tx.errors.length).toBeGreaterThan(0);
    });

    it('should reject below minimum', async () => {
      const tx = await client.buildStakeTransaction(toBigIntString(100));
      expect(tx.isValid).toBe(false);
      expect(tx.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Proposal transactions', () => {
    it('should validate valid proposal', async () => {
      const tx = await client.buildCreateProposalTransaction(
        'Test Proposal',
        'This is a test proposal',
        toBigIntString(1000000),
        1000
      );
      expect(tx.type).toBe('proposal');
      expect(tx.isValid).toBe(true);
      expect(tx.errors).toHaveLength(0);
    });

    it('should reject empty title', async () => {
      const tx = await client.buildCreateProposalTransaction(
        '',
        'Description',
        toBigIntString(1000000),
        1000
      );
      expect(tx.isValid).toBe(false);
      expect(tx.errors.some((e) => e.includes('title'))).toBe(true);
    });

    it('should reject empty description', async () => {
      const tx = await client.buildCreateProposalTransaction(
        'Title',
        '',
        toBigIntString(1000000),
        1000
      );
      expect(tx.isValid).toBe(false);
      expect(tx.errors.some((e) => e.includes('description'))).toBe(true);
    });

    it('should reject zero funding goal', async () => {
      const tx = await client.buildCreateProposalTransaction(
        'Title',
        'Description',
        toBigIntString(0),
        1000
      );
      expect(tx.isValid).toBe(false);
    });

    it('should reject zero duration', async () => {
      const tx = await client.buildCreateProposalTransaction(
        'Title',
        'Description',
        toBigIntString(1000000),
        0
      );
      expect(tx.isValid).toBe(false);
    });

    it('should reject excessive duration', async () => {
      const tx = await client.buildCreateProposalTransaction(
        'Title',
        'Description',
        toBigIntString(1000000),
        500000
      );
      expect(tx.isValid).toBe(false);
    });
  });

  describe('Vote transactions', () => {
    it('should validate valid vote', async () => {
      const tx = await client.buildVoteTransaction(
        toBigIntString(1),
        'FOR',
        toBigIntString(5),
        toBigIntString(100)
      );
      expect(tx.type).toBe('vote');
      expect(tx.isValid).toBe(true);
      expect(tx.errors).toHaveLength(0);
    });

    it('should accept FOR direction', async () => {
      const tx = await client.buildVoteTransaction(
        toBigIntString(1),
        'FOR',
        toBigIntString(5),
        toBigIntString(100)
      );
      expect(tx.isValid).toBe(true);
    });

    it('should accept AGAINST direction', async () => {
      const tx = await client.buildVoteTransaction(
        toBigIntString(1),
        'AGAINST',
        toBigIntString(5),
        toBigIntString(100)
      );
      expect(tx.isValid).toBe(true);
    });

    it('should accept ABSTAIN direction', async () => {
      const tx = await client.buildVoteTransaction(
        toBigIntString(1),
        'ABSTAIN',
        toBigIntString(5),
        toBigIntString(100)
      );
      expect(tx.isValid).toBe(true);
    });

    it('should reject invalid direction', async () => {
      const tx = await client.buildVoteTransaction(
        toBigIntString(1),
        'INVALID',
        toBigIntString(5),
        toBigIntString(100)
      );
      expect(tx.isValid).toBe(false);
      expect(tx.errors.some((e) => e.includes('direction'))).toBe(true);
    });

    it('should reject weight exceeding maximum', async () => {
      const tx = await client.buildVoteTransaction(
        toBigIntString(1),
        'FOR',
        toBigIntString(50), // Max weight is ~10 for stake 100
        toBigIntString(100)
      );
      expect(tx.isValid).toBe(false);
    });

    it('should reject zero weight', async () => {
      const tx = await client.buildVoteTransaction(
        toBigIntString(1),
        'FOR',
        toBigIntString(0),
        toBigIntString(100)
      );
      expect(tx.isValid).toBe(false);
    });
  });

  describe('Execution transactions', () => {
    it('should validate valid execution', async () => {
      const tx = await client.buildExecuteProposalTransaction(toBigIntString(1));
      expect(tx.type).toBe('execute');
      expect(tx.isValid).toBe(true);
      expect(tx.errors).toHaveLength(0);
    });

    it('should reject zero proposal ID', async () => {
      const tx = await client.buildExecuteProposalTransaction(toBigIntString(0));
      expect(tx.isValid).toBe(false);
      expect(tx.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Preflight checks', () => {
    it('should pass valid transactions', async () => {
      const tx = await client.buildStakeTransaction(toBigIntString(10000000));
      expect(client.preflightCheck(tx)).toBe(true);
    });

    it('should fail invalid transactions', async () => {
      const tx = await client.buildStakeTransaction(toBigIntString(0));
      expect(client.preflightCheck(tx)).toBe(false);
    });
  });
});
