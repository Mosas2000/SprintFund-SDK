/**
 * Mock contract executor for testing
 */

import type { ReadOnlyCallParams, ContractCallParams, ClarityValue } from '@sf-protocol/core';

export interface MockResponse {
  type: string;
  value: any;
}

export interface MockContractState {
  proposals: Map<number, any>;
  stakes: Map<string, bigint>;
  votes: Map<string, any[]>;
  totalStaked: bigint;
  proposalCount: number;
}

export class MockContractExecutor {
  private state: MockContractState;
  private callHistory: { type: 'read' | 'write'; params: any; timestamp: number }[] = [];
  private mockResponses: Map<string, MockResponse> = new Map();
  private shouldFail: boolean = false;
  private failureError: string = 'Mock failure';
  private latency: number = 0;

  constructor(initialState?: Partial<MockContractState>) {
    this.state = {
      proposals: new Map(),
      stakes: new Map(),
      votes: new Map(),
      totalStaked: 0n,
      proposalCount: 0,
      ...initialState,
    };
  }

  // Configure mock behavior
  setMockResponse(functionName: string, response: MockResponse): this {
    this.mockResponses.set(functionName, response);
    return this;
  }

  setFailure(shouldFail: boolean, error?: string): this {
    this.shouldFail = shouldFail;
    if (error) this.failureError = error;
    return this;
  }

  setLatency(ms: number): this {
    this.latency = ms;
    return this;
  }

  // State manipulation
  addProposal(proposal: any): this {
    const id = this.state.proposalCount++;
    this.state.proposals.set(id, { ...proposal, id });
    return this;
  }

  setStake(address: string, amount: bigint): this {
    const prev = this.state.stakes.get(address) ?? 0n;
    this.state.stakes.set(address, amount);
    this.state.totalStaked += amount - prev;
    return this;
  }

  addVote(proposalId: number, vote: any): this {
    const key = `${proposalId}`;
    const votes = this.state.votes.get(key) ?? [];
    votes.push(vote);
    this.state.votes.set(key, votes);
    return this;
  }

  getState(): MockContractState {
    return { ...this.state };
  }

  getCallHistory() {
    return [...this.callHistory];
  }

  clearHistory(): this {
    this.callHistory = [];
    return this;
  }

  reset(): this {
    this.state = {
      proposals: new Map(),
      stakes: new Map(),
      votes: new Map(),
      totalStaked: 0n,
      proposalCount: 0,
    };
    this.callHistory = [];
    this.mockResponses.clear();
    this.shouldFail = false;
    this.latency = 0;
    return this;
  }

  // Contract executor interface
  async callReadOnly<T>(
    params: ReadOnlyCallParams,
    decoder: (v: ClarityValue) => T
  ): Promise<T> {
    this.callHistory.push({ type: 'read', params, timestamp: Date.now() });

    if (this.latency > 0) {
      await new Promise((r) => setTimeout(r, this.latency));
    }

    if (this.shouldFail) {
      throw new Error(this.failureError);
    }

    // Check for mock response
    const mockResponse = this.mockResponses.get(params.functionName);
    if (mockResponse) {
      return decoder(mockResponse);
    }

    // Default responses based on function name
    const response = this.getDefaultResponse(params);
    return decoder(response);
  }

  async executeTransaction(params: ContractCallParams): Promise<{ txId: string }> {
    this.callHistory.push({ type: 'write', params, timestamp: Date.now() });

    if (this.latency > 0) {
      await new Promise((r) => setTimeout(r, this.latency));
    }

    if (this.shouldFail) {
      throw new Error(this.failureError);
    }

    // Simulate state changes
    this.simulateTransaction(params);

    return { txId: `mock-tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  }

  private getDefaultResponse(params: ReadOnlyCallParams): ClarityValue {
    const { functionName, functionArgs } = params;

    switch (functionName) {
      case 'get-proposal': {
        const id = functionArgs[0] as number;
        const proposal = this.state.proposals.get(id);
        if (!proposal) return { type: 'none', value: null };
        return { type: 'some', value: this.proposalToClarityValue(proposal) };
      }
      case 'get-stake-balance': {
        const address = functionArgs[0] as string;
        const amount = this.state.stakes.get(address) ?? 0n;
        return { type: 'uint', value: amount.toString() };
      }
      case 'get-voting-power': {
        const address = functionArgs[0] as string;
        const stake = this.state.stakes.get(address) ?? 0n;
        return { type: 'uint', value: stake.toString() };
      }
      case 'get-total-staked':
        return { type: 'uint', value: this.state.totalStaked.toString() };
      case 'get-proposal-count':
        return { type: 'uint', value: this.state.proposalCount.toString() };
      case 'has-voted': {
        const [proposalId, voter] = functionArgs as [number, string];
        const votes = this.state.votes.get(`${proposalId}`) ?? [];
        const hasVoted = votes.some((v) => v.voter === voter);
        return { type: 'bool', value: hasVoted };
      }
      case 'get-proposal-votes': {
        const id = functionArgs[0] as number;
        const votes = this.state.votes.get(`${id}`) ?? [];
        return {
          type: 'list',
          value: votes.map((v) => this.voteToClarityValue(v)),
        };
      }
      case 'get-governance-config':
        return {
          type: 'tuple',
          value: {
            proposalThreshold: { type: 'uint', value: '1000000' },
            quorumThreshold: { type: 'uint', value: '100000000' },
            votingPeriod: { type: 'uint', value: '144' },
            executionDelay: { type: 'uint', value: '6' },
          },
        };
      default:
        return { type: 'none', value: null };
    }
  }

  private simulateTransaction(params: ContractCallParams): void {
    const { functionName, functionArgs } = params;

    switch (functionName) {
      case 'create-proposal': {
        const [title, description, amount] = functionArgs as [string, string, bigint];
        this.addProposal({
          title,
          description,
          amount,
          creator: 'mock-sender',
          votesFor: 0n,
          votesAgainst: 0n,
          status: 'active',
          createdAt: BigInt(Date.now()),
        });
        break;
      }
      case 'vote': {
        const [proposalId, choice, weight] = functionArgs as [number, boolean, number];
        this.addVote(proposalId, {
          proposalId: BigInt(proposalId),
          voter: 'mock-sender',
          choice,
          weight: BigInt(weight),
          votedAt: BigInt(Date.now()),
        });
        break;
      }
      case 'stake': {
        const amount = functionArgs[0] as bigint;
        const current = this.state.stakes.get('mock-sender') ?? 0n;
        this.setStake('mock-sender', current + amount);
        break;
      }
      case 'unstake': {
        const amount = functionArgs[0] as bigint;
        const current = this.state.stakes.get('mock-sender') ?? 0n;
        this.setStake('mock-sender', current > amount ? current - amount : 0n);
        break;
      }
    }
  }

  private proposalToClarityValue(proposal: any): ClarityValue {
    return {
      type: 'tuple',
      value: {
        id: { type: 'uint', value: proposal.id.toString() },
        title: { type: 'string-utf8', value: proposal.title },
        description: { type: 'string-utf8', value: proposal.description },
        amount: { type: 'uint', value: proposal.amount.toString() },
        creator: { type: 'principal', value: proposal.creator },
        votesFor: { type: 'uint', value: (proposal.votesFor ?? 0n).toString() },
        votesAgainst: { type: 'uint', value: (proposal.votesAgainst ?? 0n).toString() },
        status: { type: 'string-ascii', value: proposal.status ?? 'active' },
        createdAt: { type: 'uint', value: (proposal.createdAt ?? 0n).toString() },
        executedAt: proposal.executedAt
          ? { type: 'some', value: { type: 'uint', value: proposal.executedAt.toString() } }
          : { type: 'none', value: null },
      },
    };
  }

  private voteToClarityValue(vote: any): ClarityValue {
    return {
      type: 'tuple',
      value: {
        proposalId: { type: 'uint', value: vote.proposalId.toString() },
        voter: { type: 'principal', value: vote.voter },
        choice: { type: 'bool', value: vote.choice },
        weight: { type: 'uint', value: vote.weight.toString() },
        votedAt: { type: 'uint', value: vote.votedAt.toString() },
      },
    };
  }
}

export function createMockExecutor(initialState?: Partial<MockContractState>): MockContractExecutor {
  return new MockContractExecutor(initialState);
}
