/**
 * Contract call builder for type-safe interactions
 */

export interface ContractCallParams {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  postConditions?: any[];
  network?: 'mainnet' | 'testnet';
}

export interface ContractCallResult<T> {
  success: boolean;
  txId?: string;
  result?: T;
  error?: string;
}

export class ContractCallBuilder {
  private params: Partial<ContractCallParams> = {};

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

  postConditions(conditions: any[]): this {
    this.params.postConditions = conditions;
    return this;
  }

  network(network: 'mainnet' | 'testnet'): this {
    this.params.network = network;
    return this;
  }

  build(): ContractCallParams {
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
      postConditions: this.params.postConditions,
      network: this.params.network ?? 'mainnet',
    };
  }
}

// SprintFund contract helpers
export const SPRINTFUND_CONTRACT = {
  address: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
  name: 'sprintfund-core-v3',
};

export function createProposalCall(title: string, description: string, amount: bigint) {
  return new ContractCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('create-proposal')
    .args(title, description, amount)
    .build();
}

export function voteCall(proposalId: number, choice: boolean, weight: number) {
  return new ContractCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('vote')
    .args(proposalId, choice, weight)
    .build();
}

export function stakeCall(amount: bigint) {
  return new ContractCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('stake')
    .args(amount)
    .build();
}

export function unstakeCall(amount: bigint) {
  return new ContractCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('unstake')
    .args(amount)
    .build();
}

export function executeProposalCall(proposalId: number) {
  return new ContractCallBuilder()
    .contract(SPRINTFUND_CONTRACT.address, SPRINTFUND_CONTRACT.name)
    .function('execute-proposal')
    .args(proposalId)
    .build();
}

export function createContractCall(): ContractCallBuilder {
  return new ContractCallBuilder();
}
