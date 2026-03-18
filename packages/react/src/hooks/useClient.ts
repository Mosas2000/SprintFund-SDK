import { useContext } from 'react';
import { SprintFundContext } from '../context/SprintFundContext.js';

/**
 * Hook to access the SprintFund client
 */
export function useClient() {
  const context = useContext(SprintFundContext);
  if (!context) {
    throw new Error('useClient must be used within SprintFundProvider');
  }
  return context.client;
}
