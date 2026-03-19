import { NetworkType } from '../types/index.js';
/**
 * Base client for contract interactions
 */
export declare class BaseClient {
    protected readonly network: NetworkType;
    protected readonly coreApiUrl: string;
    constructor(networkType?: NetworkType);
    getNetworkType(): NetworkType;
    getCoreApiUrl(): string;
    protected fetchJson<T>(path: string, options?: RequestInit): Promise<T>;
}
//# sourceMappingURL=base.d.ts.map