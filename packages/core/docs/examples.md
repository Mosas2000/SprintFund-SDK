# Examples - @sf-protocol/core

## Basic Setup

```typescript
import { SprintFundClient, createClient } from '@sf-protocol/core';

// Create a client
const client = new SprintFundClient('mainnet');

// Or use factory function
const client = createClient('testnet');
```

## Fetching Proposals

```typescript
// Get a single proposal
const proposal = await client.proposals.getProposal('1');

if (proposal) {
  console.log(`Proposal: ${proposal.title}`);
  console.log(`Status: ${proposal.status}`);
  console.log(`Funding: ${proposal.fundingRaised}/${proposal.fundingGoal}`);
}

// List active proposals
const active = await client.proposals.getActiveProposals(10);
active.forEach(p => console.log(p.title));

// List with pagination
const page = await client.proposals.listProposals({
  limit: 20,
  offset: 0,
  status: ProposalStatus.ACTIVE,
});
```

## Checking Stakes and Voting Power

```typescript
import { toPrincipal } from '@sf-protocol/core';

const address = toPrincipal('SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T');

// Get stake balance
const balance = await client.stakes.getBalance(address);
console.log(`You have staked: ${balance} microSTX`);

// Get voting power
const power = await client.voting.getVotingPower(address);
if (power) {
  console.log(`Max weight: ${power.maxWeight}`);
  console.log(`Available: ${power.available}`);
  console.log(`Used: ${power.currentUsed}`);
}

// Estimate vote cost
const estimate = await client.voting.estimateVoteCost(address, toBigIntString(5));
if (estimate) {
  console.log(`Voting with weight 5 will cost: ${estimate.cost}`);
}
```

## Quadratic Voting Math

```typescript
import {
  calculateVoteCost,
  calculateMaxWeight,
  isValidVoteWeight,
} from '@sf-protocol/core';

const stake = toBigIntString(10000);

// Maximum voting weight = floor(sqrt(stake))
const maxWeight = calculateMaxWeight(stake);
console.log(`Max weight for 10,000 stake: ${maxWeight}`);

// Vote cost = weight^2
const cost = calculateVoteCost('10');
console.log(`Cost to vote with weight 10: ${cost}`);

// Validate weight
const isValid = isValidVoteWeight('15', stake);
console.log(`Can vote with weight 15: ${isValid}`); // false if stake too low
```

## Building Transactions

```typescript
import { toBigIntString } from '@sf-protocol/core';

// Build and validate a stake transaction
const stakeTx = await client.transactions.buildStakeTransaction(
  toBigIntString(5000000)
);
console.log(`Stake valid: ${stakeTx.isValid}`);
if (!stakeTx.isValid) {
  stakeTx.errors.forEach(e => console.log(`  Error: ${e}`));
}

// Build and validate a proposal
const proposalTx = await client.transactions.buildCreateProposalTransaction(
  'Fund Developer Education',
  'Support for training programs',
  toBigIntString(500000),
  1000
);
console.log(`Proposal valid: ${proposalTx.isValid}`);

// Build and validate a vote
const voteTx = await client.transactions.buildVoteTransaction(
  toBigIntString(1),
  'FOR',
  toBigIntString(5),
  toBigIntString(100)
);
console.log(`Vote valid: ${voteTx.isValid}`);
if (voteTx.isValid) {
  console.log('Ready to submit vote to wallet');
}

// Preflight check
if (client.transactions.preflightCheck(voteTx)) {
  console.log('Transaction passed all validations');
}
```

## Error Handling

```typescript
import {
  ValidationError,
  ContractError,
  NetworkError,
  ProtocolError,
} from '@sf-protocol/core';

try {
  const tx = await client.transactions.buildVoteTransaction(
    toBigIntString(1),
    'INVALID_DIRECTION',
    toBigIntString(10),
    toBigIntString(100)
  );
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
    console.log('Field details:', error.context);
  } else if (error instanceof ContractError) {
    console.log(`Contract error ${error.code}: ${error.message}`);
    if (error.context.remediation) {
      console.log('Try this:', error.context.remediation);
    }
  } else if (error instanceof NetworkError) {
    console.log('Network issue:', error.message);
    // Retry logic here
  } else if (error instanceof ProtocolError) {
    console.log('Protocol error:', error.toJSON());
  }
}
```

## Cache Management

```typescript
import { toPrincipal } from '@sf-protocol/core';

const address = toPrincipal('SP...');

// First call hits the chain
const balance1 = await client.stakes.getBalance(address);

// Second call uses cache
const balance2 = await client.stakes.getBalance(address);

// Invalidate specific cache
client.stakes.invalidateCache(address);

// Clear all caches
client.clearCaches();
```

## Full Workflow Example

```typescript
import { SprintFundClient, toBigIntString, toPrincipal } from '@sf-protocol/core';

async function voteOnProposal() {
  const client = new SprintFundClient('mainnet');
  const voter = toPrincipal('SP...');
  const proposalId = toBigIntString(1);
  const weight = toBigIntString(5);

  // 1. Check voting power
  const power = await client.voting.getVotingPower(voter);
  if (!power || power.available < weight) {
    console.log('Insufficient voting power');
    return;
  }

  // 2. Estimate cost
  const estimate = await client.voting.estimateVoteCost(voter, weight);
  console.log(`Vote will cost: ${estimate?.cost}`);

  // 3. Get current balance for validation
  const balance = await client.stakes.getBalance(voter);

  // 4. Build transaction
  const voteTx = await client.transactions.buildVoteTransaction(
    proposalId,
    'FOR',
    weight,
    balance!
  );

  // 5. Validate before submission
  if (!client.transactions.preflightCheck(voteTx)) {
    console.log('Transaction validation failed:');
    voteTx.errors.forEach(e => console.log(`  - ${e}`));
    return;
  }

  console.log('Transaction ready to submit to wallet');
  // In a real app, would now call wallet.signTransaction(voteTx)
}

voteOnProposal().catch(console.error);
```
