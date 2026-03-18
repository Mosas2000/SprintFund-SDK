import { createContext, useContext, ReactNode } from 'react';
import { SprintFundClient } from '@sf-protocol/core';

export interface SprintFundContextType {
  client: SprintFundClient | null;
  isReady: boolean;
}

export const SprintFundContext = createContext<SprintFundContextType>({
  client: null,
  isReady: false,
});

export function useSprintFundContext(): SprintFundContextType {
  const context = useContext(SprintFundContext);
  if (!context) {
    throw new Error('useSprintFundContext must be used within SprintFundProvider');
  }
  return context;
}
