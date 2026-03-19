import { getNetworkConfig } from './networks.js';
/**
 * Base client for contract interactions
 */
export class BaseClient {
    constructor(networkType = 'mainnet') {
        this.network = networkType;
        const config = getNetworkConfig(networkType);
        this.coreApiUrl = config.coreApiUrl;
    }
    getNetworkType() {
        return this.network;
    }
    getCoreApiUrl() {
        return this.coreApiUrl;
    }
    async fetchJson(path, options) {
        const url = `${this.coreApiUrl}${path}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        return response.json();
    }
}
//# sourceMappingURL=base.js.map