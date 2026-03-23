# Migration Guide: v0.1.0 to v0.2.0

This guide covers migrating from SF Protocol SDK v0.1.0 to v0.2.0.

## Overview

v0.2.0 introduces significant enhancements across all packages while maintaining backward compatibility with v0.1.0 APIs.

## Breaking Changes

**None** - v0.2.0 is fully backward compatible.

## New Features by Package

### @sf-protocol/core

#### Error Recovery & Resilience

New utilities for handling failures gracefully:

```typescript
// Before: Manual retry logic
let attempts = 0;
while (attempts < 3) {
  try {
    const result = await fetchData();
    break;
  } catch (e) {
    attempts++;
  }
}

// After: Use RetryHandler
import { RetryHandler } from '@sf-protocol/core';

const retry = new RetryHandler({ maxAttempts: 3 });
const result = await retry.execute(() => fetchData());
```

#### Observability

New structured logging and metrics:

```typescript
import { StructuredLogger, MetricsCollector } from '@sf-protocol/core';

const logger = new StructuredLogger();
logger.setContext({ traceId: 'abc123' });
logger.info('Request processed', { duration: 150 });

const metrics = new MetricsCollector();
metrics.record('api.latency', 150, 'ms');
```

#### Configuration Management

```typescript
import { ConfigManager, FeatureFlagManager } from '@sf-protocol/core';

const config = new ConfigManager();
config.addEnvironment('prod', { apiUrl: 'https://api.example.com' });

const flags = new FeatureFlagManager();
flags.enable('beta-feature');
```

### @sf-protocol/react

#### Accessibility (WCAG 2.1 AA)

```typescript
import { useA11yFocus, useAriaLive } from '@sf-protocol/react';

// Focus management for modals
const { trapFocus, releaseFocus } = useA11yFocus(modalRef);

// Screen reader announcements
const { announce } = useAriaLive();
announce('Form submitted successfully', 'polite');
```

#### Advanced Caching

```typescript
import { useCache, CacheStrategies } from '@sf-protocol/react';

const { data, isStale } = useCache('key', fetcher, {
  strategy: CacheStrategies.AGGRESSIVE, // 1 hour TTL
});
```

#### Real-time Updates

```typescript
import { useRealtime } from '@sf-protocol/react';

const { subscribe, connected } = useRealtime(wsUrl);
subscribe('event', handler);
```

#### WalletConnect v2

```typescript
import { WalletProvider, useWallet } from '@sf-protocol/react';

// Wrap app with provider
<WalletProvider>
  <App />
</WalletProvider>

// Use hook
const { connect, address } = useWallet();
```

### @sf-protocol/indexer

#### Analytics Integration

```typescript
import { AnalyticsService, AnalyticsExporter } from '@sf-protocol/indexer';

const analytics = new AnalyticsService();
const metrics = await analytics.getProposalMetrics(proposalId);

const exporter = new AnalyticsExporter();
await exporter.exportToDatadog(metrics);
```

#### Audit Logging

```typescript
import { AuditLogger } from '@sf-protocol/indexer';

const audit = new AuditLogger();
audit.log({
  action: 'proposal.created',
  userId: 'user123',
  details: { proposalId: 1 }
});
```

#### RBAC

```typescript
import { RBACManager } from '@sf-protocol/indexer';

const rbac = new RBACManager();
rbac.createRole('admin', [
  { resource: 'proposals', actions: ['create', 'delete'] }
]);
```

### @sf-protocol/cli

#### Interactive Scaffolding

```bash
# New project with template selection
sf-protocol init my-app

# With specific template
sf-protocol init my-app --template enterprise --typescript
```

### @sf-protocol/testing

#### Fixture Factories

```typescript
import { createFixtureBuilder } from '@sf-protocol/testing';

const fixtures = createFixtureBuilder();
const proposal = fixtures.proposals.createActive();
const votes = fixtures.votes.createBatch(10);
```

#### Mock Clients

```typescript
import { createMockClient } from '@sf-protocol/testing';

const mock = createMockClient();
mock.setResponse('getProposal', { id: 1, title: 'Test' });
```

## Upgrade Steps

### 1. Update Dependencies

```bash
npm install @sf-protocol/core@0.2.0 @sf-protocol/react@0.2.0
```

### 2. Optional: Add New Packages

```bash
npm install @sf-protocol/testing@0.2.0  # For testing utilities
npm install @sf-protocol/cli@0.2.0      # For CLI tools
```

### 3. Adopt New Features Gradually

All new features are additive. Existing code continues to work without changes.

## Deprecations

None in v0.2.0.

## Performance Improvements

- **Caching**: New SWR pattern reduces redundant network requests
- **Request Deduplication**: Identical in-flight requests are consolidated
- **Circuit Breaker**: Prevents cascading failures under load

## TypeScript

No type signature changes. New types are additive:

```typescript
// New types available
import type {
  LogLevel,
  LogContext,
  CacheStrategy,
  HealthCheckResult
} from '@sf-protocol/core';
```

## Questions?

- GitHub Issues: https://github.com/sf-protocol/sdk/issues
- Documentation: https://docs.sf-protocol.io
