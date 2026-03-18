import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BigIntString } from '@sf-protocol/core';
import { useSprintFundContext } from '../context/SprintFundContext.js';
import { proposalKeys } from '../query-keys/proposals.js';

/**
 * Hook to execute a proposal
 */
export function useExecuteProposal() {
  const { client } = useSprintFundContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: BigIntString) => {
      if (!client) throw new Error('Client not initialized');
      return client.transactions.buildExecuteProposalTransaction(proposalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.all });
    },
  });
}

export type UseExecuteProposalReturn = ReturnType<typeof useExecuteProposal>;
