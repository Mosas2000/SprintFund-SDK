import { ProposalClient } from './proposals.js';
import { StakeClient } from './stakes.js';
import { VotingClient } from './voting.js';
import { TransactionClient } from './transactions.js';
import { NetworkType } from '../types/index.js';
/**
 * Main SprintFund protocol client
 * Unified interface for all protocol operations
 */
export declare class SprintFundClient {
    readonly proposals: ProposalClient;
    readonly stakes: StakeClient;
    readonly voting: VotingClient;
    readonly transactions: TransactionClient;
    private readonly network;
    constructor(networkType?: NetworkType);
    /**
     * Get the configured network type
     */
    getNetwork(): NetworkType;
    /**
     * Clear all caches
     */
    clearCaches(): void;
}
/**
 * Factory function to create a client
 */
export declare function createClient(networkType?: NetworkType): SprintFundClient;
//# sourceMappingURL=sprintfund.d.ts.map