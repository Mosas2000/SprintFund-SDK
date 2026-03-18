import { useQuery } from '@tanstack/react-query';
import { BigIntString, Principal } from '@sf-protocol/core';
import { useSprintFundContext } from '../context/SprintFundContext.js';
import { votingKeys } from '../query-keys/voting.js';

/**
 * Hook to estimate vote cost
 */
export function useVoteEstimator(
  voter: Principal | undefined,
  weight: BigIntString | undefined
) {
  const { client } = useSprintFundContext();

  return useQuery({
    queryKey: votingKeys.estimate(voter || '', weight || ''),
    queryFn: async () => {
      if (!voter || !weight) return null;
      return client!.voting.estimateVoteCost(voter, weight);
    },
    enabled: !!voter && !!weight && !!client,
    staleTime: 1 * 60 * 1000, // 1 minute (voting power can change)
  });
}

export type UseVoteEstimatorReturn = ReturnType<typeof useVoteEstimator>;
