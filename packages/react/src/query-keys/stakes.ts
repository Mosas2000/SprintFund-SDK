import { Principal } from '@sf-protocol/core';

export const stakeKeys = {
  all: ['stakes'] as const,
  balances: () => [...stakeKeys.all, 'balance'] as const,
  balance: (holder: Principal | string) =>
    [...stakeKeys.balances(), holder] as const,
  lists: () => [...stakeKeys.all, 'list'] as const,
  list: (limit: number, offset: number) =>
    [...stakeKeys.lists(), { limit, offset }] as const,
};
