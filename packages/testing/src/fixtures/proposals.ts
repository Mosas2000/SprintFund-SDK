/**
 * Test Fixtures
 * 
 * Pre-configured test data for common testing scenarios.
 */

import { Proposal, Vote, Principal, BigIntString } from '@sf-protocol/core';

/**
 * Sample proposal for testing
 */
export const sampleProposal: Proposal = {
  id: 1,
  title: 'Test Proposal',
  description: 'This is a test proposal for demonstration',
  creator: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T' as Principal,
  fundingGoal: '1000000' as BigIntString,
  currentRaised: '500000' as BigIntString,
  votingStartBlock: 1000,
  votingEndBlock: 2000,
  executionStartBlock: 2100,
  status: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

/**
 * Create multiple sample proposals
 */
export function createSampleProposals(count: number): Proposal[] {
  return Array.from({ length: count }, (_, i) => ({
    ...sampleProposal,
    id: i + 1,
    title: `Test Proposal ${i + 1}`,
    currentRaised: (BigInt(500000 * (i + 1))).toString() as BigIntString
  }));
}

/**
 * Sample vote for testing
 */
export const sampleVote: Vote = {
  id: 1,
  proposalId: 1,
  voter: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T' as Principal,
  weight: '100' as BigIntString,
  support: true,
  voteCost: '10000' as BigIntString,
  timestamp: Date.now()
};

/**
 * Create multiple sample votes
 */
export function createSampleVotes(proposalId: number, count: number): Vote[] {
  return Array.from({ length: count }, (_, i) => ({
    ...sampleVote,
    id: i + 1,
    proposalId,
    weight: (BigInt(100 * (i + 1))).toString() as BigIntString,
    support: i % 2 === 0
  }));
}

/**
 * Common test addresses
 */
export const testAddresses = {
  alice: 'SP2ETFQZ4Z3CTS6FDJZ4W8ZZTNVTY6YW4PBQZCQNK' as Principal,
  bob: 'SP3SZ6AEFPZ2XWDQR6X8CZW1E1R2Z6E8K4Q7R9Z9K' as Principal,
  charlie: 'SP4TZ8UK6J4ZQWE1X5E8G8B7C4X9N6M3L2K1J0H9' as Principal,
  dave: 'SP5ZA8V9X4R3E2Q1W0Y9U8T7S6R5Q4P3O2N1M0L9' as Principal,
  eve: 'SP6AB7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T' as Principal
};

/**
 * Test proposal scenarios
 */
export const proposalScenarios = {
  /**
   * Proposal with high funding goal
   */
  highFunding: {
    ...sampleProposal,
    fundingGoal: '10000000' as BigIntString,
    title: 'High Funding Goal Proposal'
  },

  /**
   * Proposal fully funded
   */
  fullyFunded: {
    ...sampleProposal,
    fundingGoal: '1000000' as BigIntString,
    currentRaised: '1000000' as BigIntString,
    title: 'Fully Funded Proposal',
    status: 'executing' as const
  },

  /**
   * Proposal ended
   */
  ended: {
    ...sampleProposal,
    votingEndBlock: 100,
    status: 'ended' as const,
    title: 'Ended Proposal'
  },

  /**
   * Rejected proposal
   */
  rejected: {
    ...sampleProposal,
    status: 'rejected' as const,
    title: 'Rejected Proposal'
  }
};

/**
 * Test vote scenarios
 */
export const voteScenarios = {
  /**
   * Vote in favor
   */
  inFavor: {
    ...sampleVote,
    support: true,
    weight: '1000' as BigIntString
  },

  /**
   * Vote against
   */
  against: {
    ...sampleVote,
    support: false,
    weight: '500' as BigIntString
  },

  /**
   * High weight vote
   */
  highWeight: {
    ...sampleVote,
    weight: '100000' as BigIntString,
    support: true
  }
};
