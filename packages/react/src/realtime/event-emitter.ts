/**
 * Real-time Event System
 * 
 * WebSocket and polling-based event streaming for live updates.
 */

export interface EventConfig {
  /**
   * Event type
   */
  type: string;

  /**
   * Event data
   */
  data: Record<string, any>;

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * Event ID for deduplication
   */
  id: string;
}

export interface RealtimeConfig {
  /**
   * WebSocket URL
   */
  wsUrl?: string;

  /**
   * Polling interval (ms) if WebSocket unavailable
   */
  pollingInterval?: number;

  /**
   * Reconnection strategy
   */
  reconnect?: {
    maxAttempts?: number;
    backoffMultiplier?: number;
    initialDelay?: number;
  };

  /**
   * Max events in buffer
   */
  maxBufferSize?: number;
}

/**
 * Event emitter for subscriptions
 */
export class EventEmitter {
  private listeners: Map<string, Set<(event: EventConfig) => void>> = new Map();
  private eventBuffer: EventConfig[] = [];
  private maxBufferSize = 100;

  /**
   * Subscribe to events
   */
  on(eventType: string, listener: (event: EventConfig) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Subscribe once
   */
  once(eventType: string, listener: (event: EventConfig) => void): () => void {
    const unsubscribe = this.on(eventType, (event) => {
      listener(event);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Emit event
   */
  emit(event: EventConfig): void {
    // Add to buffer
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift();
    }

    // Emit to listeners
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      }
    }

    // Emit to wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      for (const listener of wildcardListeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      }
    }
  }

  /**
   * Get event buffer
   */
  getBuffer(): EventConfig[] {
    return [...this.eventBuffer];
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.eventBuffer = [];
  }

  /**
   * Get listener count
   */
  getListenerCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size ?? 0;
    }

    let count = 0;
    for (const listeners of this.listeners.values()) {
      count += listeners.size;
    }
    return count;
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * Create realtime event manager
 */
export function createEventEmitter(): EventEmitter {
  return new EventEmitter();
}

export const globalEventEmitter = new EventEmitter();
