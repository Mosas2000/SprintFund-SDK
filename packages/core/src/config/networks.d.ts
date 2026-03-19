import { NetworkType } from '../types/index.js';
export interface NetworkConfig {
    name: NetworkType;
    chainId: number;
    coreApiUrl: string;
    bnsApi: string;
    bitcoinNetwork: 'mainnet' | 'testnet' | 'regtest';
}
export declare function getNetworkConfig(networkType: NetworkType): NetworkConfig;
export declare function getNetwork(networkType: NetworkType): NetworkConfig;
//# sourceMappingURL=networks.d.ts.map