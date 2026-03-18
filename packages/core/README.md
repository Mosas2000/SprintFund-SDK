# @sf-protocol/core

Type-safe TypeScript SDK for SprintFund governance protocol on Stacks blockchain.

## Features

- 🔐 **Typed Contract Client** - Full TypeScript support with compile-time safety
- 📊 **Read Operations** - Fetch proposals, stakes, voting data with automatic caching
- 🗳️ **Quadratic Voting** - Built-in mathematics for vote cost calculations
- 🔄 **Transaction Building** - Pre-validated transaction construction
- ⚡ **Error Handling** - Comprehensive error types with remediation guidance
- 💾 **Smart Caching** - Automatic cache invalidation with TTL support

## Installation

```bash
npm install @sf-protocol/core
```

## Quick Start

```typescript
import { SprintFundClient } from '@sf-protocol/core';

// Create client for mainnet
const client = new SprintFundClient('mainnet');

// Get proposal details
const proposal = await client.proposals.getProposal('1');

// Check voting power
const votingPower = await client.voting.getVotingPower('SP...');

// Estimate vote cost
const estimate = await client.voting.estimateVoteCost('SP...', '5');
```

## API

### Client Initialization

```typescript
// Mainnet (default)
const client = new SprintFundClient();

// Testnet
const client = new SprintFundClient('testnet');

// Devnet
const client = new SprintFundClient('devnet');
```

### Proposals API

```typescript
// Get single proposal
const proposal = await client.proposals.getProposal('1');

// List active proposals
const proposals = await client.proposals.getActiveProposals(10);

// List with options
const proposals = await client.proposals.listProposals({
  limit: 20,
  offset: 0,
  status: ProposalStatus.ACTIVE,
});

// Invalidate cache
client.proposals.invalidateCache();
```

### Stakes API

```typescript
// Get stake balance
const balance = await client.stakes.getBalance('SP...');

// Get top holders
const holders = await client.stakes.getTopHolders(10);

// List with options
const holders = await client.stakes.listHolders({
  limit: 20,
  offset: 0,
  minBalance: '1000000',
});
```

### Voting API

```typescript
// Get voting power
const power = await client.voting.getVotingPower('SP...');

// Get votes on proposal
const votes = await client.voting.getVotes({
  proposalId: '1',
  limit: 10,
  offset: 0,
});

// Estimate vote cost
const estimate = await client.voting.estimateVoteCost('SP...', '5');
```

### Quadratic Voting Math

```typescript
import {
  calculateVoteCost,
  calculateMaxWeight,
  calculateRemainingPower,
  isValidVoteWeight,
} from '@sf-protocol/core';

// Cost = weight^2
const cost = calculateVoteCost('5'); // Returns "25"

// Max weight = floor(sqrt(stake))
const maxWeight = calculateMaxWeight('100'); // Returns "10"

// Check if weight is valid
const isValid = isValidVoteWeight('5', '100'); // true
```

## Error Handling

```typescript
import {
  ProtocolError,
  ContractError,
  NetworkError,
  ValidationError,
} from '@sf-protocol/core';

try {
  await client.voting.getVotingPower(address);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Invalid input:', error.message);
    console.log('Details:', error.context);
  } else if (error instanceof NetworkError) {
    console.log('Network issue:', error.message);
  } else if (error instanceof ContractError) {
    console.log('Contract error:', error.message);
    console.log('Code:', error.code);
  }
}
```

## Types

All major types are exported from the package:

```typescript
import {
  Proposal,
  Vote,
  StakeBalance,
  VotingPower,
  Principal,
  BigIntString,
  // ... and many more
} from '@sf-protocol/core';
```

## Caching

The SDK uses automatic in-memory caching with TTL (Time To Live):

```typescript
// Cache is automatically used for read operations
const proposal1 = await client.proposals.getProposal('1'); // Hits chain
const proposal2 = await client.proposals.getProposal('1'); // From cache

// Clear specific cache
client.proposals.invalidateCache();

// Clear all caches
client.clearCaches();
```

## Contract Details

- **Network**: Stacks Mainnet
- **Contract**: `SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3`
- **Language**: Clarity

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## License

MIT © 2025 SF Protocol Contributors
