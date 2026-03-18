import { BaseClient } from './base.js';
import {
  Proposal,
  ProposalStatus,
  CreateProposalParams,
  ProposalListOptions,
} from '../types/proposal.js';
import { BigIntString, Principal, toBigIntString } from '../types/index.js';
import { globalCache } from '../utils/cache.js';
import { NetworkType } from '../types/index.js';
import { isProposal } from '../types/contract.js';
import { throwNetworkError } from '../errors/network.js';

/**
 * Client for proposal-related contract operations
 */
export class ProposalClient extends BaseClient {
  private readonly cacheKeyPrefix = 'proposals:';
  private readonly cacheTtl = 5 * 60 * 1000; // 5 minutes

  constructor(networkType: NetworkType = 'mainnet') {
    super(networkType);
  }

  /**
   * Fetch a single proposal by ID
   */
  async getProposal(proposalId: BigIntString): Promise<Proposal | null> {
    const cacheKey = `${this.cacheKeyPrefix}${proposalId}`;
    const cached = globalCache.get<Proposal>(cacheKey);
    if (cached) return cached;

    try {
      const proposal = await this.fetchProposalFromChain(proposalId);
      if (proposal && isProposal(proposal)) {
        globalCache.set(cacheKey, proposal, this.cacheTtl);
      }
      return proposal;
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(`Failed to fetch proposal ${proposalId}: ${error.message}`, {
          proposalId,
          network: this.getNetworkType(),
        });
      }
      return null;
    }
  }

  /**
   * List proposals with pagination
   */
  async listProposals(options: ProposalListOptions): Promise<Proposal[]> {
    const cacheKey = `${this.cacheKeyPrefix}list:${options.limit}:${options.offset}:${options.status || 'all'}`;
    const cached = globalCache.get<Proposal[]>(cacheKey);
    if (cached) return cached;

    try {
      const proposals = await this.fetchProposalsFromChain(options);
      if (Array.isArray(proposals) && proposals.every(isProposal)) {
        globalCache.set(cacheKey, proposals, this.cacheTtl);
      }
      return proposals;
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(
          `Failed to list proposals: ${error.message}`,
          {
            limit: options.limit,
            offset: options.offset,
            network: this.getNetworkType(),
          }
        );
      }
      return [];
    }
  }

  /**
   * Get active proposals
   */
  async getActiveProposals(limit: number = 10): Promise<Proposal[]> {
    return this.listProposals({
      limit,
      offset: 0,
      status: ProposalStatus.ACTIVE,
    });
  }

  /**
   * Get total proposal count
   */
  async getProposalCount(): Promise<BigIntString> {
    const cacheKey = `${this.cacheKeyPrefix}total-count`;
    const cached = globalCache.get<BigIntString>(cacheKey);
    if (cached) return cached;

    try {
      const count = await this.fetchProposalCount();
      globalCache.set(cacheKey, count, this.cacheTtl);
      return count;
    } catch (error) {
      if (error instanceof Error) {
        throwNetworkError(`Failed to get proposal count: ${error.message}`, {
          network: this.getNetworkType(),
        });
      }
      return toBigIntString(0);
    }
  }

  /**
   * Invalidate proposal cache
   */
  invalidateCache(proposalId?: BigIntString): void {
    if (proposalId) {
      globalCache.delete(`${this.cacheKeyPrefix}${proposalId}`);
    } else {
      globalCache.invalidatePattern(new RegExp(`^${this.cacheKeyPrefix}`));
    }
  }

  private async fetchProposalFromChain(
    _proposalId: BigIntString
  ): Promise<Proposal | null> {
    // Placeholder for actual chain interaction
    // Would call Stacks API or use library like @stacks/transactions
    return null;
  }

  private async fetchProposalsFromChain(
    _options: ProposalListOptions
  ): Promise<Proposal[]> {
    // Placeholder for actual chain interaction
    return [];
  }

  private async fetchProposalCount(): Promise<BigIntString> {
    // Placeholder for actual chain interaction
    return toBigIntString(0);
  }
}
