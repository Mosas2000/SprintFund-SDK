# @sf-protocol/testing

Comprehensive testing utilities and fixtures for SF Protocol SDK development.

## Installation

```bash
npm install --save-dev @sf-protocol/testing
```

## Features

### Mock Contract Provider

```typescript
import { MockContractProvider } from '@sf-protocol/testing';

const mock = new MockContractProvider({
  shouldFail: false,
  latency: 100
});

const proposal = await mock.getProposal(1);
```

### Test Fixtures

Pre-configured test data for common scenarios:

```typescript
import {
  sampleProposal,
  sampleVote,
  testAddresses,
  proposalScenarios,
  voteScenarios
} from '@sf-protocol/testing';

// Use fixtures directly
const proposal = sampleProposal;

// Or use scenarios
const fullyFunded = proposalScenarios.fullyFunded;
const rejected = proposalScenarios.rejected;
```

### Factory Functions

Generate test data with customizable properties:

```typescript
import {
  ProposalFactory,
  VoteFactory,
  StakeBalanceFactory
} from '@sf-protocol/testing';

// Create single proposal
const proposal = ProposalFactory.create({
  title: 'My Test Proposal',
  fundingGoal: '5000000' as BigIntString
});

// Create batch
const proposals = ProposalFactory.createBatch(10);

// Create specialized proposals
const fullyFunded = ProposalFactory.fullyFunded();
const highGoal = ProposalFactory.highGoal();

// Similar factories for votes and stakes
const vote = VoteFactory.inFavor();
const stake = StakeBalanceFactory.withAmount(1000000);
```

### Test Helpers

Common utilities for simplifying test code:

```typescript
import {
  assertProposal,
  proposalsEqual,
  waitFor,
  CallTracker
} from '@sf-protocol/testing';

// Assert proposal properties
assertProposal(actual, { title: 'Expected Title', status: 'active' });

// Compare proposals
const equal = proposalsEqual(proposal1, proposal2);

// Wait for condition
await waitFor(() => proposal.status === 'ended', 5000);

// Track function calls
const tracker = new CallTracker();
tracker.track(myFunction, arg1, arg2);
console.log(tracker.getCallCount()); // 1
```

## Common Use Cases

### Testing Contract Interactions

```typescript
import { describe, it, expect } from 'vitest';
import { MockContractProvider, ProposalFactory } from '@sf-protocol/testing';

describe('Contract Interactions', () => {
  it('should fetch proposals', async () => {
    const mock = new MockContractProvider();
    const proposal = ProposalFactory.create();
    mock.addProposal(proposal);

    const result = await mock.getProposal(proposal.id);
    expect(result).toEqual(proposal);
  });
});
```

### Testing Error Handling

```typescript
it('should handle contract errors', async () => {
  const mock = new MockContractProvider({
    shouldFail: true,
    failureMessage: 'Contract call failed'
  });

  await expect(mock.listProposals()).rejects.toThrow('Contract call failed');
});
```

### Testing with Multiple Voters

```typescript
import { StakeBalanceFactory, testAddresses } from '@sf-protocol/testing';

const stakes = new Map([
  StakeBalanceFactory.create({ address: testAddresses.alice, ... }),
  StakeBalanceFactory.create({ address: testAddresses.bob, ... })
]);
```

## API Reference

### MockContractProvider

- `getProposal(id: number): Promise<Proposal | null>`
- `listProposals(): Promise<Proposal[]>`
- `getStakeBalance(address: string): Promise<StakeBalance | null>`
- `getVotes(proposalId: number): Promise<Vote[]>`
- `submitProposal(proposal): Promise<string>`
- `submitVote(vote): Promise<string>`
- `addStake(address, balance): void`
- `addProposal(proposal): void`
- `setFailure(shouldFail, message?): void`
- `reset(): void`

### Factories

All factories support:
- `create(overrides?: Partial<T>): T`
- `createBatch(count, overrides?): T[]`
- Specialized factory methods (e.g., `fullyFunded()`, `highWeight()`)

### Test Helpers

- `assertProposal(proposal, expected): void`
- `assertVote(vote, expected): void`
- `proposalsEqual(a, b): boolean`
- `votesEqual(a, b): boolean`
- `waitFor(condition, timeout?, interval?): Promise<void>`
- `CallTracker` - Track function calls and results

## License

MIT © SF Protocol Team
