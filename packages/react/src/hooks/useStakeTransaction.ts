import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BigIntString } from '@sf-protocol/core';
import { useSprintFundContext } from '../context/SprintFundContext.js';
import { stakeKeys } from '../query-keys/stakes.js';

/**
 * Hook to submit a stake transaction
 */
export function useStakeTransaction() {
  const { client } = useSprintFundContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: BigIntString) => {
      if (!client) throw new Error('Client not initialized');
      return client.transactions.buildStakeTransaction(amount);
    },
    onSuccess: () => {
      // Invalidate stake-related queries
      queryClient.invalidateQueries({ queryKey: stakeKeys.all });
    },
  });
}

export type UseStakeTransactionReturn = ReturnType<typeof useStakeTransaction>;
