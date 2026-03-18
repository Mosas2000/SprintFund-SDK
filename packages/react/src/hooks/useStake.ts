import { useQuery } from '@tanstack/react-query';
import { Principal } from '@sf-protocol/core';
import { useSprintFundContext } from '../context/SprintFundContext.js';
import { stakeKeys } from '../query-keys/stakes.js';

/**
 * Hook to fetch stake balance for an address
 */
export function useStake(address: Principal | undefined) {
  const { client } = useSprintFundContext();

  return useQuery({
    queryKey: stakeKeys.balance(address || ''),
    queryFn: async () => {
      if (!address) return null;
      return client!.stakes.getBalance(address);
    },
    enabled: !!address && !!client,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export type UseStakeReturn = ReturnType<typeof useStake>;
