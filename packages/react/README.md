# @sf-protocol/react

React hooks library for SprintFund governance protocol integration.

## Features

- 🎣 **Complete Hook Library** - All protocol operations as React hooks
- 🔌 **Context Provider** - Simple setup with SprintFundProvider
- 📊 **Query Integration** - Built on @tanstack/react-query for caching
- 💰 **Transaction Hooks** - Create, validate, and submit transactions
- 🎯 **Type-Safe** - Full TypeScript support with strict types
- ⚡ **Optimistic Updates** - Instant UI feedback for mutations

## Installation

```bash
npm install @sf-protocol/react @sf-protocol/core react @tanstack/react-query
```

## Quick Start

```typescript
import { SprintFundProvider, useProposals, useStake } from '@sf-protocol/react';

function App() {
  return (
    <SprintFundProvider network="mainnet">
      <ProposalList />
    </SprintFundProvider>
  );
}

function ProposalList() {
  const { data: proposals, isLoading } = useProposals({ limit: 10 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {proposals?.map(p => (
        <div key={p.id.toString()}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## Data Fetching Hooks

### useProposal

Fetch a single proposal by ID.

```typescript
import { useProposal } from '@sf-protocol/react';
import { toBigIntString } from '@sf-protocol/core';

const { data: proposal, isLoading, error } = useProposal(
  toBigIntString(1)
);
```

### useProposals

List proposals with pagination.

```typescript
const { data: proposals, isLoading } = useProposals({
  limit: 20,
  offset: 0,
});
```

### useStake

Get stake balance for an address.

```typescript
const { data: balance } = useStake(address);
```

### useVoteEstimator

Estimate the cost of a vote.

```typescript
const { data: estimate } = useVoteEstimator(voter, toBigIntString(5));
console.log(`Vote cost: ${estimate?.cost}`);
```

## Transaction Hooks

### useStakeTransaction

```typescript
const { mutate: submitStake, isPending } = useStakeTransaction();

const handleStake = () => {
  submitStake(toBigIntString(1000000), {
    onSuccess: (tx) => {
      console.log('Stake transaction ready:', tx);
    },
  });
};
```

### useCreateProposal

```typescript
const { mutate: createProposal } = useCreateProposal();

const handleCreateProposal = () => {
  createProposal({
    title: 'My Proposal',
    description: 'Description',
    fundingGoal: toBigIntString(500000),
    durationBlocks: 1000,
  });
};
```

### useVote

```typescript
const { mutate: submitVote } = useVote();

const handleVote = () => {
  submitVote({
    proposalId: toBigIntString(1),
    direction: 'FOR',
    weight: toBigIntString(5),
    stake: balance!,
  });
};
```

### useExecuteProposal

```typescript
const { mutate: executeProposal } = useExecuteProposal();

const handleExecute = () => {
  executeProposal(toBigIntString(1));
};
```

## Provider Setup

Wrap your app with SprintFundProvider:

```typescript
import { SprintFundProvider } from '@sf-protocol/react';

function App() {
  return (
    <SprintFundProvider network="mainnet">
      <YourApp />
    </SprintFundProvider>
  );
}
```

## Query Keys

Access query keys for manual cache management:

```typescript
import { proposalKeys, stakeKeys, votingKeys } from '@sf-protocol/react';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific queries
queryClient.invalidateQueries({
  queryKey: proposalKeys.all,
});

// Refetch specific query
queryClient.refetchQueries({
  queryKey: stakeKeys.balance(address),
});
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## License

MIT © 2025 SF Protocol Contributors
