/**
 * Real-time Notification Hook
 */

import { useEffect, useRef, useCallback } from 'react';
import { EventEmitter, EventConfig } from '../realtime/event-emitter';
import { WebSocketManager } from '../realtime/websocket';

export interface NotificationConfig {
  /**
   * WebSocket URL for real-time updates
   */
  wsUrl: string;

  /**
   * Auto-connect on mount
   */
  autoConnect?: boolean;

  /**
   * Event types to subscribe to
   */
  subscribeToTypes?: string[];
}

export interface Notification extends EventConfig {
  /**
   * Notification title
   */
  title?: string;

  /**
   * Notification message
   */
  message?: string;

  /**
   * Severity level
   */
  severity?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Hook for real-time notifications
 */
export function useRealtime(config: NotificationConfig) {
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const emitterRef = useRef<EventEmitter | null>(null);
  const unsubscribesRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    // Initialize emitter and manager
    const emitter = new EventEmitter();
    emitterRef.current = emitter;

    const wsManager = new WebSocketManager({
      wsUrl: config.wsUrl,
      emitter
    });
    wsManagerRef.current = wsManager;

    // Auto-connect if enabled
    if (config.autoConnect ?? true) {
      wsManager.connect().catch((error) => {
        console.error('Failed to connect to realtime:', error);
      });
    }

    // Subscribe to requested event types
    if (config.subscribeToTypes) {
      for (const eventType of config.subscribeToTypes) {
        const unsubscribe = emitter.on(eventType, () => {
          // Listener registered externally
        });
        unsubscribesRef.current.push(unsubscribe);
      }
    }

    // Cleanup
    return () => {
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];
      wsManager.disconnect();
    };
  }, [config.wsUrl, config.subscribeToTypes]);

  return {
    /**
     * Subscribe to notifications
     */
    on: (eventType: string, handler: (notification: Notification) => void): (() => void) => {
      return emitterRef.current?.on(eventType, handler) || (() => {});
    },

    /**
     * Subscribe once
     */
    once: (eventType: string, handler: (notification: Notification) => void): (() => void) => {
      return emitterRef.current?.once(eventType, handler) || (() => {});
    },

    /**
     * Get connection state
     */
    getState: () => wsManagerRef.current?.getState() || 'disconnected',

    /**
     * Get event history
     */
    getEventHistory: () => emitterRef.current?.getBuffer() || [],

    /**
     * Check if connected
     */
    isConnected: () => wsManagerRef.current?.isConnected() || false,

    /**
     * Listen to connection state changes
     */
    onStateChange: (callback: (state: any) => void): (() => void) => {
      return wsManagerRef.current?.onStateChange(callback) || (() => {});
    }
  };
}

export default useRealtime;
