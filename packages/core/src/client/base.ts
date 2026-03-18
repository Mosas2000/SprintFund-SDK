import { NetworkType } from '../types/index.js';
import { getNetworkConfig } from './networks.js';

/**
 * Base client for contract interactions
 */
export class BaseClient {
  protected readonly network: NetworkType;
  protected readonly coreApiUrl: string;

  constructor(networkType: NetworkType = 'mainnet') {
    this.network = networkType;
    const config = getNetworkConfig(networkType);
    this.coreApiUrl = config.coreApiUrl;
  }

  getNetworkType(): NetworkType {
    return this.network;
  }

  getCoreApiUrl(): string {
    return this.coreApiUrl;
  }

  protected async fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
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

    return response.json() as Promise<T>;
  }
}
