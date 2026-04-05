/**
 * Read-only contract function helpers
 */

import { SPRINTFUND_CONTRACT } from './calls';

export interface ReadOnlyCallParams {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  senderAddress?: string;
}

export class ReadOnlyCallBuilder {
  private params: Partial<ReadOnlyCallParams> = {};

  contract(address: string, name: string): this {
    this.params.contractAddress = address;
    this.params.contractName = name;
    return this;
  }

  function(name: string): this {
    this.params.functionName = name;
    return this;
  }

  args(...args: any[]): this {
    this.params.functionArgs = args;
    return this;
  }

  sender(address: string): this {
    this.params.senderAddress = address;
    return this;
  }

  build(): ReadOnlyCallParams {
    if (!this.params.contractAddress || !this.params.contractName) {
      throw new Error('Contract address and name required');
    }
    if (!this.params.functionName) {
      throw new Error('Function name required');
    }
    return {
      contractAddress: this.params.contractAddress,
      contractName: this.params.contractName,
      functionName: this.params.functionName,
      functionArgs: this.params.functionArgs ?? [],
      senderAddress: this.params.senderAddress,
    };
  }
}

// SprintFund read-only helpers
export function getProposalCall(proposalId: number) {
  return new ReadOnlyCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('get-proposal')
    .args(proposalId)
    .build();
}

export function getStakeBalanceCall(address: string) {
  return new ReadOnlyCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('get-stake-balance')
    .args(address)
    .build();
}

export function getVotingPowerCall(address: string) {
  return new ReadOnlyCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('get-voting-power')
    .args(address)
    .build();
}

export function getProposalVotesCall(proposalId: number) {
  return new ReadOnlyCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('get-proposal-votes')
    .args(proposalId)
    .build();
}

export function getGovernanceConfigCall() {
  return new ReadOnlyCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('get-governance-config')
    .build();
}

export function getTotalStakedCall() {
  return new ReadOnlyCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('get-total-staked')
    .build();
}

export function getProposalCountCall() {
  return new ReadOnlyCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('get-proposal-count')
    .build();
}

export function hasVotedCall(proposalId: number, voterAddress: string) {
  return new ReadOnlyCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('has-voted')
    .args(proposalId, voterAddress)
    .build();
}

export function createReadOnlyCall(): ReadOnlyCallBuilder {
  return new ReadOnlyCallBuilder();
}
