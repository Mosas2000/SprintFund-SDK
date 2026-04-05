/**
 * SprintFund contract integration facade
 */

import {
  SPRINTFUND_CONTRACT,
  createProposalCall,
  voteCall,
  stakeCall,
  unstakeCall,
  executeProposalCall,
  ContractCallParams,
} from './calls';
import {
  getProposalCall,
  getStakeBalanceCall,
  getVotingPowerCall,
  getProposalVotesCall,
  getGovernanceConfigCall,
  getTotalStakedCall,
  getProposalCountCall,
  hasVotedCall,
  ReadOnlyCallParams,
} from './reads';
import {
  Proposal,
  StakeInfo,
  VoteInfo,
  GovernanceConfig,
  decodeProposal,
  decodeVoteInfo,
  decodeGovernanceConfig,
  decodeUint,
  decodeBool,
  decodeOptional,
  decodeList,
  ClarityValue,
} from './decoders';
import {
  createPostConditions,
} from './post-conditions';

export interface ContractExecutor {
  callReadOnly<T>(params: ReadOnlyCallParams, decoder: (v: ClarityValue) => T): Promise<T>;
  executeTransaction(params: ContractCallParams): Promise<{ txId: string }>;
}

export class SprintFundContract {
  constructor(private executor: ContractExecutor) {}

  get address(): string {
    return SPRINTFUND_CONTRACT.address;
  }

  get name(): string {
    return SPRINTFUND_CONTRACT.name;
  }

  // Read operations
  async getProposal(proposalId: number): Promise<Proposal | null> {
    const params = getProposalCall(proposalId);
    return this.executor.callReadOnly(params, (v) => decodeOptional(v, decodeProposal));
  }

  async getStakeBalance(address: string): Promise<bigint> {
    const params = getStakeBalanceCall(address);
    return this.executor.callReadOnly(params, decodeUint);
  }

  async getVotingPower(address: string): Promise<bigint> {
    const params = getVotingPowerCall(address);
    return this.executor.callReadOnly(params, decodeUint);
  }

  async getProposalVotes(proposalId: number): Promise<VoteInfo[]> {
    const params = getProposalVotesCall(proposalId);
    return this.executor.callReadOnly(params, (v) => decodeList(v, decodeVoteInfo));
  }

  async getGovernanceConfig(): Promise<GovernanceConfig> {
    const params = getGovernanceConfigCall();
    return this.executor.callReadOnly(params, decodeGovernanceConfig);
  }

  async getTotalStaked(): Promise<bigint> {
    const params = getTotalStakedCall();
    return this.executor.callReadOnly(params, decodeUint);
  }

  async getProposalCount(): Promise<bigint> {
    const params = getProposalCountCall();
    return this.executor.callReadOnly(params, decodeUint);
  }

  async hasVoted(proposalId: number, voterAddress: string): Promise<boolean> {
    const params = hasVotedCall(proposalId, voterAddress);
    return this.executor.callReadOnly(params, decodeBool);
  }

  // Write operations
  async createProposal(
    title: string,
    description: string,
    amount: bigint
  ): Promise<{ txId: string }> {
    const params = createProposalCall(title, description, amount);
    return this.executor.executeTransaction(params);
  }

  async vote(
    proposalId: number,
    choice: boolean,
    weight: number
  ): Promise<{ txId: string }> {
    const params = voteCall(proposalId, choice, weight);
    return this.executor.executeTransaction(params);
  }

  async stake(
    amount: bigint,
    senderAddress?: string
  ): Promise<{ txId: string }> {
    const params = stakeCall(amount);
    if (senderAddress) {
      params.postConditions = createPostConditions()
        .stxExact(senderAddress, amount)
        .build().conditions;
    }
    return this.executor.executeTransaction(params);
  }

  async unstake(amount: bigint): Promise<{ txId: string }> {
    const params = unstakeCall(amount);
    return this.executor.executeTransaction(params);
  }

  async executeProposal(proposalId: number): Promise<{ txId: string }> {
    const params = executeProposalCall(proposalId);
    return this.executor.executeTransaction(params);
  }

  // Composite queries
  async getProposals(startId: number, count: number): Promise<Proposal[]> {
    const proposals: Proposal[] = [];
    for (let i = startId; i < startId + count; i++) {
      const proposal = await this.getProposal(i);
      if (proposal) {
        proposals.push(proposal);
      }
    }
    return proposals;
  }

  async getStakeInfo(address: string): Promise<StakeInfo> {
    const [amount, votingPower] = await Promise.all([
      this.getStakeBalance(address),
      this.getVotingPower(address),
    ]);
    return {
      amount,
      stakedAt: 0n, // Would need additional call
      votingPower,
    };
  }
}

export function createSprintFundContract(executor: ContractExecutor): SprintFundContract {
  return new SprintFundContract(executor);
}
