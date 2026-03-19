/**
 * Multi-chain Wallet Context
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { WalletConnectManager, WalletSession, WalletAccount } from '../wallet/walletconnect';

export interface WalletContextType {
  manager: WalletConnectManager | null;
  session: WalletSession | null;
  account: WalletAccount | null;
  isConnected: boolean;
  connect: (networks?: string[]) => Promise<WalletSession>;
  disconnect: () => Promise<void>;
  switchAccount: (address: string) => Promise<WalletAccount>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export interface WalletProviderProps {
  children: ReactNode;
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

/**
 * Wallet provider component
 */
export function WalletProvider({ children, projectId, metadata }: WalletProviderProps) {
  const manager = useMemo(
    () =>
      new WalletConnectManager({
        projectId,
        metadata,
        autoRestore: true
      }),
    [projectId, metadata]
  );

  const value = useMemo(
    () => ({
      manager,
      session: manager.getSession(),
      account: manager.getAccount(),
      isConnected: manager.isConnected(),
      connect: (networks?: string[]) => manager.connect(networks as any),
      disconnect: () => manager.disconnect(),
      switchAccount: (address: string) => manager.switchAccount(address)
    }),
    [manager]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/**
 * Use wallet context
 */
export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
}
