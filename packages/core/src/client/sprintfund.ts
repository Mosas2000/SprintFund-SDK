import { ProposalClient } from './proposals.js';
import { StakeClient } from './stakes.js';
import { VotingClient } from './voting.js';
import { TransactionClient } from './transactions.js';
import { NetworkType } from '../types/index.js';

/**
 * Main SprintFund protocol client
 * Unified interface for all protocol operations
 */
export class SprintFundClient {
  public readonly proposals: ProposalClient;
  public readonly stakes: StakeClient;
  public readonly voting: VotingClient;
  public readonly transactions: TransactionClient;
  private readonly network: NetworkType;

  constructor(networkType: NetworkType = 'mainnet') {
    this.network = networkType;
    this.proposals = new ProposalClient(networkType);
    this.stakes = new StakeClient(networkType);
    this.voting = new VotingClient(networkType);
    this.transactions = new TransactionClient(networkType);
  }

  /**
   * Get the configured network type
   */
  getNetwork(): NetworkType {
    return this.network;
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.proposals.invalidateCache();
    this.stakes.invalidateCache();
    this.voting.invalidateCache();
  }
}

/**
 * Factory function to create a client
 */
export function createClient(networkType: NetworkType = 'mainnet'): SprintFundClient {
  return new SprintFundClient(networkType);
}
