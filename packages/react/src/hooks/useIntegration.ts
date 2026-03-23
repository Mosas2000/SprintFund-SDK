/**
 * React hooks for event bus and plugin integration
 */

import { useEffect, useState, useCallback } from 'react';
import { getEventBus, getPluginManager } from '../exports.js';

export function useEventBus() {
  return getEventBus();
}

export function useEventListener<T = any>(event: string, handler: (payload: T) => void) {
  const eventBus = getEventBus();

  useEffect(() => {
    const sub = eventBus.on(event, handler);
    return () => sub.unsubscribe();
  }, [event, handler, eventBus]);
}

export function useEventHistory(event?: string) {
  const eventBus = getEventBus();
  const [history, setHistory] = useState(() => eventBus.getHistory(event));

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(eventBus.getHistory(event));
    }, 1000);
    return () => clearInterval(interval);
  }, [event, eventBus]);

  return history;
}

export function usePluginManager() {
  return getPluginManager();
}

export function usePluginStatus(pluginName: string) {
  const manager = getPluginManager();
  const [initialized, setInitialized] = useState(() => manager.isInitialized(pluginName));

  useEffect(() => {
    const interval = setInterval(() => {
      setInitialized(manager.isInitialized(pluginName));
    }, 500);
    return () => clearInterval(interval);
  }, [pluginName, manager]);

  return { initialized };
}

export function useEventEmitter() {
  const eventBus = getEventBus();

  return useCallback(
    (event: string, payload?: any) => {
      return eventBus.emit(event, payload);
    },
    [eventBus]
  );
}
