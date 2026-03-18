import { BigIntString, Principal } from '@sf-protocol/core';

export const votingKeys = {
  all: ['voting'] as const,
  powers: () => [...votingKeys.all, 'power'] as const,
  power: (voter: Principal | string) =>
    [...votingKeys.powers(), voter] as const,
  estimates: () => [...votingKeys.all, 'estimate'] as const,
  estimate: (voter: Principal | string, weight: BigIntString | string) =>
    [...votingKeys.estimates(), { voter, weight }] as const,
  votes: () => [...votingKeys.all, 'votes'] as const,
  vote: (proposalId: BigIntString | string) =>
    [...votingKeys.votes(), proposalId] as const,
};
