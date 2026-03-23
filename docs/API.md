# SF Protocol SDK - API Reference

## Overview

The SF Protocol SDK provides type-safe clients for interacting with the SprintFund governance protocol on the Stacks blockchain.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| `@sf-protocol/core` | Core contract client and utilities | 0.2.0 |
| `@sf-protocol/react` | React hooks and components | 0.2.0 |
| `@sf-protocol/indexer` | Analytics and data indexing | 0.2.0 |
| `@sf-protocol/cli` | CLI tools and scaffolding | 0.2.0 |
| `@sf-protocol/testing` | Test utilities and mocks | 0.2.0 |

## Quick Start

```bash
npm install @sf-protocol/core @sf-protocol/react
```

```typescript
import { SprintFundClient } from '@sf-protocol/core';
import { SprintFundProvider, useProposals } from '@sf-protocol/react';

// Initialize client
const client = new SprintFundClient({ network: 'mainnet' });

// Fetch proposals
const proposals = await client.proposals.list();
```

## Core Package

### SprintFundClient

The main entry point for interacting with the SprintFund contract.

```typescript
import { SprintFundClient } from '@sf-protocol/core';

const client = new SprintFundClient({
  network: 'mainnet',
  contractAddress: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3'
});
```

#### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `proposals.list()` | List all proposals | `Promise<Proposal[]>` |
| `proposals.get(id)` | Get proposal by ID | `Promise<Proposal>` |
| `stakes.get(address)` | Get stake balance | `Promise<bigint>` |
| `voting.getVotingPower(address)` | Calculate voting power | `Promise<number>` |

### Error Recovery

```typescript
import { RetryHandler, CircuitBreaker } from '@sf-protocol/core';

// Retry with exponential backoff
const retry = new RetryHandler({ maxAttempts: 3, initialDelayMs: 100 });
const result = await retry.execute(() => client.proposals.list());

// Circuit breaker pattern
const breaker = new CircuitBreaker(5, 2, 30000);
const data = await breaker.execute(() => fetchData());
```

### Observability

```typescript
import { StructuredLogger, MetricsCollector, HealthChecker } from '@sf-protocol/core';

// Structured logging
const logger = new StructuredLogger(LogLevel.INFO);
logger.setContext({ userId: 'user123', traceId: 'abc' });
logger.info('Operation completed', { duration: 150 });

// Metrics collection
const metrics = new MetricsCollector();
metrics.record('api.latency', 150, 'ms');
metrics.histogram('request.time', [100, 200, 300]);

// Health checks
const health = new HealthChecker();
health.register('database', async () => db.ping());
const status = await health.check();
```

### Configuration

```typescript
import { ConfigManager, FeatureFlagManager } from '@sf-protocol/core';

const config = new ConfigManager();
config.addEnvironment('production', { apiUrl: 'https://api.sf-protocol.io' });
config.setEnvironment('production');

const flags = new FeatureFlagManager();
flags.enable('new-voting-ui');
if (flags.isEnabled('new-voting-ui')) { /* ... */ }
```

## React Package

### Provider Setup

```tsx
import { SprintFundProvider } from '@sf-protocol/react';

function App() {
  return (
    <SprintFundProvider network="mainnet">
      <YourApp />
    </SprintFundProvider>
  );
}
```

### Hooks

#### useProposals

```tsx
const { proposals, loading, error, refetch } = useProposals();
```

#### useProposal

```tsx
const { proposal, loading, error } = useProposal(proposalId);
```

#### useVote

```tsx
const { vote, loading, error } = useVote();
await vote(proposalId, 'for', weight);
```

#### useStake

```tsx
const { stake, balance, loading } = useStake(address);
```

### Accessibility

```tsx
import { useA11yFocus, useAriaLive } from '@sf-protocol/react';

// Focus management
const { trapFocus, releaseFocus } = useA11yFocus(modalRef);

// ARIA announcements
const { announce } = useAriaLive();
announce('Proposal submitted successfully');
```

### Caching

```tsx
import { useCache, CacheStrategies } from '@sf-protocol/react';

const { data, isStale, refresh } = useCache('proposals', fetchProposals, {
  strategy: CacheStrategies.STANDARD
});
```

### Real-time Updates

```tsx
import { useRealtime } from '@sf-protocol/react';

const { subscribe, connected } = useRealtime('wss://api.sf-protocol.io/ws');

useEffect(() => {
  return subscribe('proposal:created', (proposal) => {
    console.log('New proposal:', proposal);
  });
}, []);
```

### Wallet Integration

```tsx
import { WalletProvider, useWallet } from '@sf-protocol/react';

function ConnectButton() {
  const { connect, disconnect, address, connected } = useWallet();
  
  return connected ? (
    <button onClick={disconnect}>Disconnect {address}</button>
  ) : (
    <button onClick={() => connect('stacks')}>Connect Wallet</button>
  );
}
```

## Testing Package

### Fixture Factories

```typescript
import { createFixtureBuilder } from '@sf-protocol/testing';

const fixtures = createFixtureBuilder();

// Create test proposals
const proposal = fixtures.proposals.create({ status: 'active' });
const proposals = fixtures.proposals.createBatch(10);

// Create test votes
const vote = fixtures.votes.createFor(1, { weight: 10 });
```

### Mock Clients

```typescript
import { createMockClient } from '@sf-protocol/testing';

const mock = createMockClient();
await mock.createProposal({ title: 'Test' });
expect(mock.getCallCount('createProposal')).toBe(1);
```

### Test Helpers

```typescript
import { setupTestEnvironment } from '@sf-protocol/testing';

const { time, blockchain, async, cleanup } = setupTestEnvironment();

// Freeze time
time.freeze(Date.now());

// Mine blocks
blockchain.mineBlocks(100);

// Wait for condition
await async.waitFor(() => condition, { timeout: 5000 });

// Cleanup
cleanup();
```

## CLI Package

### Project Scaffolding

```bash
sf-protocol init my-app --template standard --typescript
```

### Available Templates

| Template | Description |
|----------|-------------|
| `minimal` | Basic setup with core SDK |
| `standard` | Core + React hooks |
| `advanced` | Full stack with indexer |
| `enterprise` | Complete with CI/CD and Docker |

### Commands

```bash
sf-protocol init <name>     # Create new project
sf-protocol generate        # Generate types from contract
sf-protocol codegen         # Generate TypeScript definitions
```

## Error Handling

All SDK methods throw typed errors:

```typescript
import { SDKError, NetworkError, ValidationError } from '@sf-protocol/core';

try {
  await client.proposals.create(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid data:', error.fields);
  } else if (error instanceof NetworkError) {
    console.error('Network issue:', error.statusCode);
  }
}
```

## TypeScript Support

Full TypeScript support with strict types:

```typescript
import type { Proposal, Vote, Stake } from '@sf-protocol/core';

const proposal: Proposal = await client.proposals.get(1);
```

## License

MIT
