import { BigIntString } from '@sf-protocol/core';

export const proposalKeys = {
  all: ['proposals'] as const,
  lists: () => [...proposalKeys.all, 'list'] as const,
  list: (limit: number, offset: number) =>
    [...proposalKeys.lists(), { limit, offset }] as const,
  details: () => [...proposalKeys.all, 'detail'] as const,
  detail: (id: BigIntString) => [...proposalKeys.details(), id] as const,
};
