/**
 * Stale-While-Revalidate Pattern
 * 
 * Serves cached data while revalidating in background.
 */

export interface SWRConfig {
  /**
   * Deduplicate identical requests within window (ms)
   */
  dedupeInterval?: number;

  /**
   * Focus revalidation interval (ms)
   */
  focusInterval?: number;

  /**
   * Refetch on reconnect
   */
  refetchOnReconnect?: boolean;

  /**
   * Deduplicate mutations
   */
  deduplicateMutations?: boolean;
}

/**
 * Track in-flight requests to avoid duplication
 */
export class RequestDeduplicator {
  private inFlight: Map<string, Promise<any>> = new Map();
  private config: Required<SWRConfig>;

  constructor(config: SWRConfig = {}) {
    this.config = {
      dedupeInterval: config.dedupeInterval ?? 100,
      focusInterval: config.focusInterval ?? 5000,
      refetchOnReconnect: config.refetchOnReconnect ?? true,
      deduplicateMutations: config.deduplicateMutations ?? true
    };
  }

  /**
   * Execute with deduplication
   */
  async execute<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // Check if already in flight
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key)!;
    }

    // Create new promise
    const promise = fn();

    // Store in flight
    this.inFlight.set(key, promise);

    // Remove after settling
    promise
      .then(
        () => {
          this.inFlight.delete(key);
        },
        () => {
          this.inFlight.delete(key);
        }
      )
      .catch(() => {
        // Ignore
      });

    return promise;
  }

  /**
   * Clear specific or all in-flight requests
   */
  clear(key?: string): void {
    if (key) {
      this.inFlight.delete(key);
    } else {
      this.inFlight.clear();
    }
  }

  /**
   * Get in-flight request
   */
  getInFlight(key: string): Promise<any> | undefined {
    return this.inFlight.get(key);
  }

  /**
   * Check if request is in flight
   */
  isInFlight(key: string): boolean {
    return this.inFlight.has(key);
  }
}

/**
 * Handle network reconnection
 */
export class NetworkAwareCache {
  private online = typeof window !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<() => void> = new Set();

  constructor(private deduplicator: RequestDeduplicator) {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Handle coming online
   */
  private handleOnline(): void {
    this.online = true;
    this.notifyListeners();
  }

  /**
   * Handle going offline
   */
  private handleOffline(): void {
    this.online = false;
  }

  /**
   * Subscribe to online/offline changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify subscribers
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return this.online;
  }

  /**
   * Deduplicate with network awareness
   */
  async executeWithNetwork<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    if (!this.online) {
      throw new Error('Application is offline');
    }

    return this.deduplicator.execute(key, fn);
  }
}

/**
 * Create SWR cache manager
 */
export function createSWRCache(config?: SWRConfig) {
  const deduplicator = new RequestDeduplicator(config);
  const networkAware = new NetworkAwareCache(deduplicator);

  return {
    deduplicator,
    networkAware,
    async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
      return deduplicator.execute(key, fn);
    },
    async executeWithNetwork<T>(key: string, fn: () => Promise<T>): Promise<T> {
      return networkAware.executeWithNetwork(key, fn);
    }
  };
}
