/**
 * Cross-package event bus for SDK-wide communication
 */

export type EventHandler<T = any> = (payload: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe: () => void;
}

export interface EventBusOptions {
  maxListeners?: number;
  asyncMode?: boolean;
  debug?: boolean;
}

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private wildcardHandlers = new Set<EventHandler>();
  private eventHistory: Array<{ event: string; payload: any; timestamp: number }> = [];
  private maxHistory = 100;
  private options: EventBusOptions;

  constructor(options: EventBusOptions = {}) {
    this.options = {
      maxListeners: options.maxListeners ?? 100,
      asyncMode: options.asyncMode ?? true,
      debug: options.debug ?? false,
    };
  }

  on<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (event === '*') {
      this.wildcardHandlers.add(handler);
      return { unsubscribe: () => this.wildcardHandlers.delete(handler) };
    }

    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    const handlers = this.handlers.get(event)!;
    handlers.add(handler);
    return { unsubscribe: () => handlers.delete(handler) };
  }

  once<T>(event: string, handler: EventHandler<T>): EventSubscription {
    const wrappedHandler: EventHandler<T> = (payload) => {
      this.off(event, wrappedHandler);
      return handler(payload);
    };
    return this.on(event, wrappedHandler);
  }

  off(event: string, handler?: EventHandler): void {
    if (event === '*') {
      handler ? this.wildcardHandlers.delete(handler) : this.wildcardHandlers.clear();
      return;
    }
    if (!handler) {
      this.handlers.delete(event);
      return;
    }
    this.handlers.get(event)?.delete(handler);
  }

  async emit<T>(event: string, payload: T): Promise<void> {
    this.recordEvent(event, payload);
    const handlers = this.handlers.get(event) ?? new Set();
    const allHandlers = [...handlers, ...this.wildcardHandlers];

    await Promise.all(
      allHandlers.map(async (handler) => {
        try { await handler(payload); } catch (e) { console.error(`Event error:`, e); }
      })
    );
  }

  getHistory(event?: string): Array<{ event: string; payload: any; timestamp: number }> {
    return event ? this.eventHistory.filter((e) => e.event === event) : [...this.eventHistory];
  }

  getListenerCount(event?: string): number {
    if (event) return (this.handlers.get(event)?.size ?? 0) + this.wildcardHandlers.size;
    let total = this.wildcardHandlers.size;
    for (const h of this.handlers.values()) total += h.size;
    return total;
  }

  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
    this.eventHistory = [];
  }

  private recordEvent(event: string, payload: any): void {
    this.eventHistory.push({ event, payload, timestamp: Date.now() });
    if (this.eventHistory.length > this.maxHistory) this.eventHistory.shift();
  }
}

export const SDKEvents = {
  CLIENT_INITIALIZED: 'client:initialized',
  CLIENT_ERROR: 'client:error',
  PROPOSAL_CREATED: 'proposal:created',
  PROPOSAL_UPDATED: 'proposal:updated',
  VOTE_CAST: 'vote:cast',
  STAKE_DEPOSITED: 'stake:deposited',
  STAKE_WITHDRAWN: 'stake:withdrawn',
  WALLET_CONNECTED: 'wallet:connected',
  WALLET_DISCONNECTED: 'wallet:disconnected',
  CACHE_HIT: 'cache:hit',
  CACHE_MISS: 'cache:miss',
  NETWORK_ERROR: 'network:error',
} as const;

const globalEventBus = new EventBus();

export function getEventBus(): EventBus { return globalEventBus; }
export function createEventBus(options?: EventBusOptions): EventBus { return new EventBus(options); }
export { globalEventBus };
