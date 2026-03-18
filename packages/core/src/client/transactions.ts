import { BaseClient } from './base.js';
import { NetworkType } from '../types/index.js';
import { validateStakeTransaction, validateProposalParameters, validateVoteParameters } from '../errors/validation.js';
import { BigIntString } from '../types/index.js';

/**
 * Built transaction with preflight validation
 */
export interface ValidatedTransaction {
  type: 'stake' | 'proposal' | 'vote' | 'execute';
  isValid: boolean;
  errors: string[];
  metadata: Record<string, unknown>;
}

/**
 * Client for transaction building and submission
 */
export class TransactionClient extends BaseClient {
  constructor(networkType: NetworkType = 'mainnet') {
    super(networkType);
  }

  /**
   * Build and validate a stake deposit transaction
   */
  async buildStakeTransaction(
    amount: BigIntString
  ): Promise<ValidatedTransaction> {
    const errors: string[] = [];
    let isValid = true;

    try {
      validateStakeTransaction(amount);
    } catch (error) {
      isValid = false;
      if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    return {
      type: 'stake',
      isValid,
      errors,
      metadata: {
        amount,
        network: this.getNetworkType(),
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Build and validate a proposal creation transaction
   */
  async buildCreateProposalTransaction(
    title: string,
    description: string,
    fundingGoal: BigIntString,
    durationBlocks: number
  ): Promise<ValidatedTransaction> {
    const errors: string[] = [];
    let isValid = true;

    if (!title || title.length === 0) {
      errors.push('Proposal title is required');
      isValid = false;
    }

    if (!description || description.length === 0) {
      errors.push('Proposal description is required');
      isValid = false;
    }

    try {
      validateProposalParameters(fundingGoal, durationBlocks);
    } catch (error) {
      isValid = false;
      if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    return {
      type: 'proposal',
      isValid,
      errors,
      metadata: {
        title,
        description,
        fundingGoal,
        durationBlocks,
        network: this.getNetworkType(),
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Build and validate a vote transaction
   */
  async buildVoteTransaction(
    proposalId: BigIntString,
    direction: string,
    weight: BigIntString,
    stake: BigIntString
  ): Promise<ValidatedTransaction> {
    const errors: string[] = [];
    let isValid = true;

    if (!['FOR', 'AGAINST', 'ABSTAIN'].includes(direction)) {
      errors.push(`Invalid vote direction: ${direction}`);
      isValid = false;
    }

    try {
      validateVoteParameters(weight, stake);
    } catch (error) {
      isValid = false;
      if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    return {
      type: 'vote',
      isValid,
      errors,
      metadata: {
        proposalId,
        direction,
        weight,
        stake,
        network: this.getNetworkType(),
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Build and validate a proposal execution transaction
   */
  async buildExecuteProposalTransaction(
    proposalId: BigIntString
  ): Promise<ValidatedTransaction> {
    const errors: string[] = [];
    let isValid = true;

    if (!proposalId || proposalId === '0') {
      errors.push('Valid proposal ID is required');
      isValid = false;
    }

    return {
      type: 'execute',
      isValid,
      errors,
      metadata: {
        proposalId,
        network: this.getNetworkType(),
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Perform preflight checks on transaction
   */
  preflightCheck(tx: ValidatedTransaction): boolean {
    return tx.isValid && tx.errors.length === 0;
  }
}
