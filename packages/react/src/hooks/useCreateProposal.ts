import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BigIntString } from '@sf-protocol/core';
import { useSprintFundContext } from '../context/SprintFundContext.js';
import { proposalKeys } from '../query-keys/proposals.js';

interface CreateProposalParams {
  title: string;
  description: string;
  fundingGoal: BigIntString;
  durationBlocks: number;
}

/**
 * Hook to create a proposal
 */
export function useCreateProposal() {
  const { client } = useSprintFundContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateProposalParams) => {
      if (!client) throw new Error('Client not initialized');
      return client.transactions.buildCreateProposalTransaction(
        params.title,
        params.description,
        params.fundingGoal,
        params.durationBlocks
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.all });
    },
  });
}

export type UseCreateProposalReturn = ReturnType<typeof useCreateProposal>;
