import { useQuery } from '@tanstack/react-query';
import { BigIntString } from '@sf-protocol/core';
import { useSprintFundContext } from '../context/SprintFundContext.js';
import { proposalKeys } from '../query-keys/proposals.js';

/**
 * Hook to fetch a single proposal
 */
export function useProposal(proposalId: BigIntString | undefined) {
  const { client } = useSprintFundContext();

  return useQuery({
    queryKey: proposalKeys.detail(proposalId || ''),
    queryFn: async () => {
      if (!proposalId) return null;
      return client!.proposals.getProposal(proposalId);
    },
    enabled: !!proposalId && !!client,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export type UseProposalReturn = ReturnType<typeof useProposal>;
