/**
 * React hooks for SDK state management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStore, Store, StateSelector } from '@sf-protocol/core';

export function useStore<T extends Record<string, any>, R = T>(
  store?: Store<T>,
  selector?: StateSelector<T, R>
) {
  const targetStore = store ?? (getStore() as unknown as Store<T>);
  const [state, setState] = useState(() => {
    const current = targetStore.getState();
    return selector ? selector(current) : current;
  });

  useEffect(() => {
    return targetStore.subscribe((newState) => {
      const value = selector ? selector(newState) : newState;
      setState(value as R);
    });
  }, [targetStore, selector]);

  const dispatch = useCallback(
    (partial: Partial<T> | ((state: T) => Partial<T>)) => {
      targetStore.setState(partial);
    },
    [targetStore]
  );

  return [state, dispatch] as const;
}

export function useSelector<T extends Record<string, any>, R>(
  selector: StateSelector<T, R>,
  store?: Store<T>
): R {
  const [state] = useStore(store, selector);
  return state as R;
}

export function useSDKState() {
  return useStore();
}

export function useSDKLoading() {
  return useSelector((state: any) => state.loading);
}

export function useSDKError() {
  return useSelector((state: any) => state.error);
}

export function useSDKNetwork() {
  return useSelector((state: any) => state.network);
}

export function useConnectedAddress() {
  return useSelector((state: any) => state.connectedAddress);
}

export function useSDKInitialized() {
  return useSelector((state: any) => state.initialized);
}
