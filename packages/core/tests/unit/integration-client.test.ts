import { describe, it, expect } from 'vitest';
import { SprintFundClient, createClient } from '../src/client/sprintfund.js';
import { toBigIntString } from '../src/types/index.js';

describe('SprintFundClient Integration', () => {
  describe('Client initialization', () => {
    it('should create client on mainnet', () => {
      const client = new SprintFundClient('mainnet');
      expect(client.getNetwork()).toBe('mainnet');
    });

    it('should create client on testnet', () => {
      const client = new SprintFundClient('testnet');
      expect(client.getNetwork()).toBe('testnet');
    });

    it('should create client on devnet', () => {
      const client = new SprintFundClient('devnet');
      expect(client.getNetwork()).toBe('devnet');
    });

    it('should create client with factory function', () => {
      const client = createClient('mainnet');
      expect(client.getNetwork()).toBe('mainnet');
    });
  });

  describe('Client sub-components', () => {
    let client: SprintFundClient;

    beforeEach(() => {
      client = new SprintFundClient();
    });

    it('should provide proposals client', () => {
      expect(client.proposals).toBeDefined();
      expect(client.proposals.getProposal).toBeDefined();
      expect(client.proposals.listProposals).toBeDefined();
    });

    it('should provide stakes client', () => {
      expect(client.stakes).toBeDefined();
      expect(client.stakes.getBalance).toBeDefined();
      expect(client.stakes.listHolders).toBeDefined();
    });

    it('should provide voting client', () => {
      expect(client.voting).toBeDefined();
      expect(client.voting.getVotingPower).toBeDefined();
      expect(client.voting.estimateVoteCost).toBeDefined();
    });

    it('should provide transactions client', () => {
      expect(client.transactions).toBeDefined();
      expect(client.transactions.buildStakeTransaction).toBeDefined();
      expect(client.transactions.buildCreateProposalTransaction).toBeDefined();
      expect(client.transactions.buildVoteTransaction).toBeDefined();
    });
  });

  describe('Cache management', () => {
    let client: SprintFundClient;

    beforeEach(() => {
      client = new SprintFundClient();
    });

    it('should clear all caches', () => {
      expect(() => client.clearCaches()).not.toThrow();
    });

    it('should support network-specific operations', async () => {
      const mainnetClient = new SprintFundClient('mainnet');
      const testnetClient = new SprintFundClient('testnet');

      expect(mainnetClient.getNetwork()).not.toBe(testnetClient.getNetwork());
    });
  });

  describe('Workflow scenarios', () => {
    let client: SprintFundClient;

    beforeEach(() => {
      client = new SprintFundClient('mainnet');
    });

    it('should support stake validation workflow', async () => {
      const stakeTx = await client.transactions.buildStakeTransaction(
        toBigIntString(10000000)
      );

      expect(stakeTx.type).toBe('stake');
      expect(stakeTx.isValid).toBe(true);
      expect(stakeTx.metadata.amount).toBe('10000000');
    });

    it('should support proposal creation workflow', async () => {
      const proposalTx = await client.transactions.buildCreateProposalTransaction(
        'Test Proposal',
        'A test proposal description',
        toBigIntString(1000000),
        1000
      );

      expect(proposalTx.type).toBe('proposal');
      expect(proposalTx.isValid).toBe(true);
      expect(proposalTx.metadata.title).toBe('Test Proposal');
    });

    it('should support voting workflow', async () => {
      const voteTx = await client.transactions.buildVoteTransaction(
        toBigIntString(1),
        'FOR',
        toBigIntString(5),
        toBigIntString(100)
      );

      expect(voteTx.type).toBe('vote');
      expect(voteTx.isValid).toBe(true);
    });
  });
});
