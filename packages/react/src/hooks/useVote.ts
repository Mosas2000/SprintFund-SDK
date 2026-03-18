import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BigIntString } from '@sf-protocol/core';
import { useSprintFundContext } from '../context/SprintFundContext.js';
import { votingKeys } from '../query-keys/voting.js';

interface SubmitVoteParams {
  proposalId: BigIntString;
  direction: 'FOR' | 'AGAINST' | 'ABSTAIN';
  weight: BigIntString;
  stake: BigIntString;
}

/**
 * Hook to submit a vote
 */
export function useVote() {
  const { client } = useSprintFundContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitVoteParams) => {
      if (!client) throw new Error('Client not initialized');
      return client.transactions.buildVoteTransaction(
        params.proposalId,
        params.direction,
        params.weight,
        params.stake
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: votingKeys.all });
    },
  });
}

export type UseVoteReturn = ReturnType<typeof useVote>;
