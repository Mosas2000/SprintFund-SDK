import { ReactNode, useMemo } from 'react';
import { SprintFundClient } from '@sf-protocol/core';
import { SprintFundContext, SprintFundContextType } from '../context/SprintFundContext.js';

interface SprintFundProviderProps {
  children: ReactNode;
  network?: 'mainnet' | 'testnet' | 'devnet';
}

/**
 * Provider component for SprintFund protocol context
 */
export function SprintFundProvider({
  children,
  network = 'mainnet',
}: SprintFundProviderProps): JSX.Element {
  const value = useMemo<SprintFundContextType>(() => {
    const client = new SprintFundClient(network);
    return {
      client,
      isReady: true,
    };
  }, [network]);

  return (
    <SprintFundContext.Provider value={value}>
      {children}
    </SprintFundContext.Provider>
  );
}
