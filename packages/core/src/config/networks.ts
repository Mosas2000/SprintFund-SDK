import { NetworkType } from '../types/index.js';

export interface NetworkConfig {
  name: NetworkType;
  chainId: number;
  coreApiUrl: string;
  bnsApi: string;
  bitcoinNetwork: 'mainnet' | 'testnet' | 'regtest';
}

const MAINNET_CONFIG: NetworkConfig = {
  name: 'mainnet',
  chainId: 1,
  coreApiUrl: 'https://api.mainnet.hiro.so',
  bnsApi: 'https://api.mainnet.hiro.so',
  bitcoinNetwork: 'mainnet',
};

const TESTNET_CONFIG: NetworkConfig = {
  name: 'testnet',
  chainId: 2147483648,
  coreApiUrl: 'https://api.testnet.hiro.so',
  bnsApi: 'https://api.testnet.hiro.so',
  bitcoinNetwork: 'testnet',
};

const DEVNET_CONFIG: NetworkConfig = {
  name: 'devnet',
  chainId: 2147483649,
  coreApiUrl: 'http://localhost:3999',
  bnsApi: 'http://localhost:3999',
  bitcoinNetwork: 'regtest',
};

export function getNetworkConfig(networkType: NetworkType): NetworkConfig {
  switch (networkType) {
    case 'mainnet':
      return MAINNET_CONFIG;
    case 'testnet':
      return TESTNET_CONFIG;
    case 'devnet':
      return DEVNET_CONFIG;
    default:
      throw new Error(`Unknown network: ${networkType}`);
  }
}

export function getNetwork(networkType: NetworkType): NetworkConfig {
  return getNetworkConfig(networkType);
}
