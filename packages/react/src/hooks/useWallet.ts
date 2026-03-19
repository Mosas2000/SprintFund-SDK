/**
 * Wallet Integration Hook
 */

import { useContext, useCallback, useEffect, useState } from 'react';
import { WalletConnectManager, WalletSession, WalletAccount } from '../wallet/walletconnect';

export interface UseWalletOptions {
  /**
   * Project ID
   */
  projectId: string;

  /**
   * App metadata
   */
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };

  /**
   * Auto-connect on mount
   */
  autoConnect?: boolean;
}

/**
 * Hook for wallet integration
 */
export function useWallet(options: UseWalletOptions) {
  const [manager] = useState(() =>
    new WalletConnectManager({
      projectId: options.projectId,
      metadata: options.metadata,
      autoRestore: options.autoConnect ?? false
    })
  );

  const [session, setSession] = useState<WalletSession | null>(manager.getSession());
  const [account, setAccount] = useState<WalletAccount | null>(manager.getAccount());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to wallet events
  useEffect(() => {
    const unsubscribes = [
      manager.on('wallet:connected', (event) => {
        setSession(event.data.session);
        setAccount(event.data.session.account);
        setError(null);
      }),

      manager.on('wallet:disconnected', () => {
        setSession(null);
        setAccount(null);
      }),

      manager.on('wallet:account-changed', (event) => {
        setAccount(event.data.account);
      }),

      manager.on('wallet:error', (event) => {
        setError(new Error(event.data.error));
      })
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [manager]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const newSession = await manager.connect();
      setSession(newSession);
      setAccount(newSession.account);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsConnecting(false);
    }
  }, [manager]);

  const disconnect = useCallback(async () => {
    try {
      await manager.disconnect();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [manager]);

  const switchAccount = useCallback(
    async (address: string) => {
      try {
        const newAccount = await manager.switchAccount(address);
        setAccount(newAccount);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [manager]
  );

  return {
    session,
    account,
    isConnecting,
    isConnected: manager.isConnected(),
    error,
    connect,
    disconnect,
    switchAccount,
    manager
  };
}

export default useWallet;
