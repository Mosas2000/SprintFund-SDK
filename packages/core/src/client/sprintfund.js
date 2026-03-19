import { ProposalClient } from './proposals.js';
import { StakeClient } from './stakes.js';
import { VotingClient } from './voting.js';
import { TransactionClient } from './transactions.js';
/**
 * Main SprintFund protocol client
 * Unified interface for all protocol operations
 */
export class SprintFundClient {
    constructor(networkType = 'mainnet') {
        this.network = networkType;
        this.proposals = new ProposalClient(networkType);
        this.stakes = new StakeClient(networkType);
        this.voting = new VotingClient(networkType);
        this.transactions = new TransactionClient(networkType);
    }
    /**
     * Get the configured network type
     */
    getNetwork() {
        return this.network;
    }
    /**
     * Clear all caches
     */
    clearCaches() {
        this.proposals.invalidateCache();
        this.stakes.invalidateCache();
        this.voting.invalidateCache();
    }
}
/**
 * Factory function to create a client
 */
export function createClient(networkType = 'mainnet') {
    return new SprintFundClient(networkType);
}
//# sourceMappingURL=sprintfund.js.map