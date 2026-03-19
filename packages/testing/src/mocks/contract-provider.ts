/**
 * Mock Contract Provider
 * 
 * Provides mock implementations of contract interactions for testing.
 */

import { Proposal, Vote, StakeBalance, Principal, BigIntString } from '@sf-protocol/core';

export interface MockContractConfig {
  proposals?: Proposal[];
  stakes?: Map<string, StakeBalance>;
  votes?: Vote[];
  shouldFail?: boolean;
  failureMessage?: string;
  latency?: number;
}

export class MockContractProvider {
  private proposals: Proposal[];
  private stakes: Map<string, StakeBalance>;
  private votes: Vote[];
  private shouldFail: boolean;
  private failureMessage: string;
  private latency: number;
  private callCount = 0;

  constructor(config: MockContractConfig = {}) {
    this.proposals = config.proposals || [];
    this.stakes = config.stakes || new Map();
    this.votes = config.votes || [];
    this.shouldFail = config.shouldFail || false;
    this.failureMessage = config.failureMessage || 'Mock contract error';
    this.latency = config.latency || 0;
  }

  /**
   * Simulate latency
   */
  private async delay(): Promise<void> {
    if (this.latency > 0) {
      return new Promise(resolve => setTimeout(resolve, this.latency));
    }
  }

  /**
   * Get proposal by ID
   */
  async getProposal(id: number): Promise<Proposal | null> {
    await this.delay();
    this.callCount++;

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    return this.proposals.find(p => p.id === id) || null;
  }

  /**
   * List all proposals
   */
  async listProposals(): Promise<Proposal[]> {
    await this.delay();
    this.callCount++;

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    return [...this.proposals];
  }

  /**
   * Get stake balance
   */
  async getStakeBalance(address: string): Promise<StakeBalance | null> {
    await this.delay();
    this.callCount++;

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    return this.stakes.get(address) || null;
  }

  /**
   * Get votes for proposal
   */
  async getVotes(proposalId: number): Promise<Vote[]> {
    await this.delay();
    this.callCount++;

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    return this.votes.filter(v => v.proposalId === proposalId);
  }

  /**
   * Submit proposal (mock)
   */
  async submitProposal(proposal: Omit<Proposal, 'id'>): Promise<string> {
    await this.delay();
    this.callCount++;

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    const newId = this.proposals.length + 1;
    const newProposal: Proposal = { ...proposal, id: newId } as Proposal;
    this.proposals.push(newProposal);

    return `tx_proposal_${newId}`;
  }

  /**
   * Submit vote (mock)
   */
  async submitVote(vote: Vote): Promise<string> {
    await this.delay();
    this.callCount++;

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    this.votes.push(vote);
    return `tx_vote_${Date.now()}`;
  }

  /**
   * Add mock stake
   */
  addStake(address: string, balance: StakeBalance): void {
    this.stakes.set(address, balance);
  }

  /**
   * Add mock proposal
   */
  addProposal(proposal: Proposal): void {
    this.proposals.push(proposal);
  }

  /**
   * Set failure state
   */
  setFailure(shouldFail: boolean, message?: string): void {
    this.shouldFail = shouldFail;
    if (message) {
      this.failureMessage = message;
    }
  }

  /**
   * Get call count
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Reset mock
   */
  reset(): void {
    this.proposals = [];
    this.stakes.clear();
    this.votes = [];
    this.callCount = 0;
    this.shouldFail = false;
  }
}

/**
 * Create a mock contract provider
 */
export function createMockContractProvider(config?: MockContractConfig): MockContractProvider {
  return new MockContractProvider(config);
}
