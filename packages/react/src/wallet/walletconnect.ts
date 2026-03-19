/**
 * WalletConnect v2 Manager
 * 
 * Multi-chain wallet connection management for Stacks and cross-chain.
 */

import { EventEmitter } from '../realtime/event-emitter';

export type WalletNetwork = 'stacks-mainnet' | 'stacks-testnet' | 'ethereum-mainnet' | 'bitcoin-mainnet';

export interface WalletAccount {
  /**
   * Account address
   */
  address: string;

  /**
   * Account name
   */
  name?: string;

  /**
   * Chain/network
   */
  network: WalletNetwork;

  /**
   * Public key
   */
  publicKey?: string;

  /**
   * Wallet provider
   */
  provider?: string;
}

export interface WalletSession {
  /**
   * Session ID
   */
  id: string;

  /**
   * Active account
   */
  account: WalletAccount;

  /**
   * All connected accounts
   */
  accounts: WalletAccount[];

  /**
   * Session creation time
   */
  createdAt: number;

  /**
   * Session expiration (unix timestamp)
   */
  expiresAt: number;

  /**
   * Session metadata
   */
  metadata?: Record<string, any>;
}

export interface WalletConnectConfig {
  /**
   * Project ID from WalletConnect Cloud
   */
  projectId: string;

  /**
   * Metadata about your application
   */
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };

  /**
   * Supported chains
   */
  chains?: WalletNetwork[];

  /**
   * Session storage key
   */
  storageKey?: string;

  /**
   * Auto-restore session on init
   */
  autoRestore?: boolean;
}

/**
 * WalletConnect v2 Manager
 */
export class WalletConnectManager {
  private config: Required<WalletConnectConfig>;
  private session: WalletSession | null = null;
  private emitter: EventEmitter;
  private connectionPromise: Promise<WalletSession> | null = null;

  constructor(config: WalletConnectConfig) {
    this.config = {
      projectId: config.projectId,
      metadata: config.metadata,
      chains: config.chains ?? [
        'stacks-mainnet',
        'ethereum-mainnet',
        'bitcoin-mainnet'
      ],
      storageKey: config.storageKey ?? 'wc-session',
      autoRestore: config.autoRestore ?? true
    };

    this.emitter = new EventEmitter();

    if (this.config.autoRestore) {
      this.restoreSession();
    }
  }

  /**
   * Connect wallet
   */
  async connect(networks?: WalletNetwork[]): Promise<WalletSession> {
    // Prevent multiple concurrent connection attempts
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        this.emitter.emit({
          type: 'wallet:connecting',
          data: { networks: networks || this.config.chains },
          timestamp: Date.now(),
          id: `connect-${Date.now()}`
        });

        // Simulate connection (actual implementation would use WalletConnect SDK)
        const session = this.createSession(networks);

        this.session = session;
        this.saveSession(session);

        this.emitter.emit({
          type: 'wallet:connected',
          data: { session },
          timestamp: Date.now(),
          id: `connected-${Date.now()}`
        });

        return session;
      } catch (error) {
        this.emitter.emit({
          type: 'wallet:error',
          data: { error: String(error) },
          timestamp: Date.now(),
          id: `error-${Date.now()}`
        });

        throw error;
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    if (!this.session) return;

    this.emitter.emit({
      type: 'wallet:disconnecting',
      data: { sessionId: this.session.id },
      timestamp: Date.now(),
      id: `disconnecting-${Date.now()}`
    });

    this.session = null;
    this.clearSession();

    this.emitter.emit({
      type: 'wallet:disconnected',
      data: {},
      timestamp: Date.now(),
      id: `disconnected-${Date.now()}`
    });
  }

  /**
   * Switch account
   */
  async switchAccount(address: string): Promise<WalletAccount> {
    if (!this.session) {
      throw new Error('No active session');
    }

    const account = this.session.accounts.find((a) => a.address === address);
    if (!account) {
      throw new Error('Account not found');
    }

    this.session.account = account;
    this.saveSession(this.session);

    this.emitter.emit({
      type: 'wallet:account-changed',
      data: { account },
      timestamp: Date.now(),
      id: `account-changed-${Date.now()}`
    });

    return account;
  }

  /**
   * Get current session
   */
  getSession(): WalletSession | null {
    return this.session;
  }

  /**
   * Get active account
   */
  getAccount(): WalletAccount | null {
    return this.session?.account || null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.session !== null && this.session.expiresAt > Date.now();
  }

  /**
   * Subscribe to wallet events
   */
  on(eventType: string, handler: (event: any) => void): () => void {
    return this.emitter.on(eventType, handler);
  }

  /**
   * Restore session from storage
   */
  private restoreSession(): void {
    try {
      if (typeof window === 'undefined') return;

      const stored = sessionStorage.getItem(this.config.storageKey);
      if (!stored) return;

      const session = JSON.parse(stored) as WalletSession;

      // Check expiration
      if (session.expiresAt > Date.now()) {
        this.session = session;

        this.emitter.emit({
          type: 'wallet:restored',
          data: { session },
          timestamp: Date.now(),
          id: `restored-${Date.now()}`
        });
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  }

  /**
   * Save session to storage
   */
  private saveSession(session: WalletSession): void {
    try {
      if (typeof window === 'undefined') return;
      sessionStorage.setItem(this.config.storageKey, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Clear session storage
   */
  private clearSession(): void {
    try {
      if (typeof window === 'undefined') return;
      sessionStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Create test session
   */
  private createSession(networks?: WalletNetwork[]): WalletSession {
    const chainList = networks || this.config.chains;
    const accounts: WalletAccount[] = chainList.map((network) => ({
      address: `test-${network}-${Math.random().toString(36).slice(2, 8)}`,
      network,
      provider: 'test-wallet'
    }));

    return {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      account: accounts[0],
      accounts,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
  }
}

/**
 * Create WalletConnect manager
 */
export function createWalletConnectManager(
  config: WalletConnectConfig
): WalletConnectManager {
  return new WalletConnectManager(config);
}
