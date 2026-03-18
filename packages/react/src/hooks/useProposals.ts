import { useQuery } from '@tanstack/react-query';
import { useSprintFundContext } from '../context/SprintFundContext.js';
import { proposalKeys } from '../query-keys/proposals.js';

interface UseProposalsOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch a list of proposals
 */
export function useProposals(options: UseProposalsOptions = {}) {
  const { limit = 10, offset = 0, enabled = true } = options;
  const { client } = useSprintFundContext();

  return useQuery({
    queryKey: proposalKeys.list(limit, offset),
    queryFn: async () => {
      return client!.proposals.listProposals({
        limit,
        offset,
      });
    },
    enabled: enabled && !!client,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export type UseProposalsReturn = ReturnType<typeof useProposals>;
