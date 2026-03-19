import { BaseClient } from './base.js';
import { NetworkType } from '../types/index.js';
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
export declare class TransactionClient extends BaseClient {
    constructor(networkType?: NetworkType);
    /**
     * Build and validate a stake deposit transaction
     */
    buildStakeTransaction(amount: BigIntString): Promise<ValidatedTransaction>;
    /**
     * Build and validate a proposal creation transaction
     */
    buildCreateProposalTransaction(title: string, description: string, fundingGoal: BigIntString, durationBlocks: number): Promise<ValidatedTransaction>;
    /**
     * Build and validate a vote transaction
     */
    buildVoteTransaction(proposalId: BigIntString, direction: string, weight: BigIntString, stake: BigIntString): Promise<ValidatedTransaction>;
    /**
     * Build and validate a proposal execution transaction
     */
    buildExecuteProposalTransaction(proposalId: BigIntString): Promise<ValidatedTransaction>;
    /**
     * Perform preflight checks on transaction
     */
    preflightCheck(tx: ValidatedTransaction): boolean;
}
//# sourceMappingURL=transactions.d.ts.map