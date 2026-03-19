/**
 * WebSocket Manager for Real-time Updates
 */

import { EventEmitter, EventConfig, RealtimeConfig } from './event-emitter';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface WebSocketManagerConfig extends RealtimeConfig {
  /**
   * Event emitter to use
   */
  emitter?: EventEmitter;
}

/**
 * Manages WebSocket connections for real-time updates
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketManagerConfig>;
  private emitter: EventEmitter;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private eventDeduplicator: Set<string> = new Set();
  private eventDedupeWindow = 5000; // 5 seconds
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();

  constructor(config: WebSocketManagerConfig = {}) {
    this.emitter = config.emitter || new EventEmitter();
    this.config = {
      wsUrl: config.wsUrl || '',
      pollingInterval: config.pollingInterval || 30000,
      reconnect: {
        maxAttempts: config.reconnect?.maxAttempts ?? 5,
        backoffMultiplier: config.reconnect?.backoffMultiplier ?? 2,
        initialDelay: config.reconnect?.initialDelay ?? 1000
      },
      maxBufferSize: config.maxBufferSize || 100
    };
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    if (!this.config.wsUrl) {
      throw new Error('WebSocket URL not configured');
    }

    this.setState('connecting');

    try {
      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.onopen = () => {
        this.setState('connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        this.setState('error');
      };

      this.ws.onclose = () => {
        this.setState('disconnected');
        this.attemptReconnect();
      };

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
        const unsub = this.onStateChange((state) => {
          if (state === 'connected') {
            clearTimeout(timeout);
            unsub();
            resolve();
          } else if (state === 'error') {
            clearTimeout(timeout);
            unsub();
            reject(new Error('Connection failed'));
          }
        });
      });
    } catch (error) {
      this.setState('error');
      throw error;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('disconnected');
  }

  /**
   * Subscribe to events
   */
  on(eventType: string, listener: (event: EventConfig) => void): () => void {
    return this.emitter.on(eventType, listener);
  }

  /**
   * Emit event (for testing/internal use)
   */
  emit(event: EventConfig): void {
    this.emitter.emit(event);
  }

  /**
   * Get connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }

  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach((listener) => {
        try {
          listener(newState);
        } catch (error) {
          console.error('State change listener error:', error);
        }
      });
    }
  }

  private handleMessage(data: any): void {
    const event: EventConfig = {
      type: data.type || 'unknown',
      data: data.data || {},
      timestamp: data.timestamp || Date.now(),
      id: data.id || `${Date.now()}-${Math.random()}`
    };

    // Deduplicate events
    if (this.isDuplicate(event.id)) {
      return;
    }

    this.emitter.emit(event);
  }

  private isDuplicate(eventId: string): boolean {
    if (this.eventDeduplicator.has(eventId)) {
      return true;
    }

    this.eventDeduplicator.add(eventId);

    // Clean up old IDs
    setTimeout(() => {
      this.eventDeduplicator.delete(eventId);
    }, this.eventDedupeWindow);

    return false;
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.config.reconnect.maxAttempts) {
      this.setState('error');
      return;
    }

    this.setState('reconnecting');
    const delay =
      this.config.reconnect.initialDelay *
      Math.pow(this.config.reconnect.backoffMultiplier, this.reconnectAttempts);

    await new Promise((resolve) => setTimeout(resolve, delay));
    this.reconnectAttempts++;

    try {
      await this.connect();
    } catch (error) {
      console.error('Reconnection failed:', error);
      this.attemptReconnect();
    }
  }
}

/**
 * Create WebSocket manager
 */
export function createWebSocketManager(config?: WebSocketManagerConfig): WebSocketManager {
  return new WebSocketManager(config);
}
