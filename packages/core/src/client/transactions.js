import { BaseClient } from './base.js';
import { validateStakeTransaction, validateProposalParameters, validateVoteParameters } from '../errors/validation.js';
/**
 * Client for transaction building and submission
 */
export class TransactionClient extends BaseClient {
    constructor(networkType = 'mainnet') {
        super(networkType);
    }
    /**
     * Build and validate a stake deposit transaction
     */
    async buildStakeTransaction(amount) {
        const errors = [];
        let isValid = true;
        try {
            validateStakeTransaction(amount);
        }
        catch (error) {
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
    async buildCreateProposalTransaction(title, description, fundingGoal, durationBlocks) {
        const errors = [];
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
        }
        catch (error) {
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
    async buildVoteTransaction(proposalId, direction, weight, stake) {
        const errors = [];
        let isValid = true;
        if (!['FOR', 'AGAINST', 'ABSTAIN'].includes(direction)) {
            errors.push(`Invalid vote direction: ${direction}`);
            isValid = false;
        }
        try {
            validateVoteParameters(weight, stake);
        }
        catch (error) {
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
    async buildExecuteProposalTransaction(proposalId) {
        const errors = [];
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
    preflightCheck(tx) {
        return tx.isValid && tx.errors.length === 0;
    }
}
//# sourceMappingURL=transactions.js.map