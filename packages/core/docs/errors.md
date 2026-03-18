# Error Reference - @sf-protocol/core

## Error Classes

### `ProtocolError`

Base error class for all protocol-related errors.

```typescript
class ProtocolError extends Error {
  code: number;
  context: Record<string, unknown>;
  timestamp: number;
  toJSON(): Record<string, unknown>;
}
```

### `ContractError`

Errors returned from contract interactions.

```typescript
throw new ContractError(message, code, context);
```

### `NetworkError`

Network and RPC-related errors.

```typescript
throw new NetworkError(message, context);
```

### `ValidationError`

Input validation errors.

```typescript
throw new ValidationError(message, context);
```

## Contract Error Codes

| Code | Error | Remediation |
|------|-------|-------------|
| 1 | Invalid proposal ID | Verify the proposal ID is correct |
| 2 | Proposal not active | Wait until the proposal becomes active |
| 3 | Insufficient stake | Stake more tokens before voting |
| 4 | Invalid vote weight | Reduce the weight or check your limit |
| 5 | Already voted | You have already voted on this proposal |
| 6 | Proposal not ended | Wait for voting period to end |
| 7 | Unauthorized | Ensure you have required permissions |
| 8 | Invalid parameters | Check the parameters and try again |
| 9 | Insufficient funds | Ensure you have enough funds |
| 10 | Invalid address | Verify the address format |

## Common Error Patterns

### Handling Validation Errors

```typescript
try {
  const tx = await client.transactions.buildVoteTransaction(
    proposalId,
    'INVALID',
    weight,
    stake
  );
  if (!tx.isValid) {
    console.log('Validation failed:');
    tx.errors.forEach(err => console.log(`  - ${err}`));
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Input validation failed:', error.message);
    console.log('Context:', error.context);
  }
}
```

### Handling Contract Errors

```typescript
try {
  const balance = await client.stakes.getBalance(address);
} catch (error) {
  if (error instanceof ContractError) {
    console.log(`Contract error (${error.code}): ${error.message}`);
    if (error.context.remediation) {
      console.log('Suggestion:', error.context.remediation);
    }
  }
}
```

### Handling Network Errors

```typescript
try {
  const proposals = await client.proposals.listProposals({ limit: 10, offset: 0 });
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
    // Implement retry logic
  }
}
```

## Error Serialization

All errors can be serialized to JSON for logging:

```typescript
try {
  // Some operation
} catch (error) {
  if (error instanceof ProtocolError) {
    const errorJson = error.toJSON();
    console.log(JSON.stringify(errorJson, null, 2));
    // Save to log file, send to monitoring service, etc.
  }
}
```

Output format:
```json
{
  "name": "ContractError",
  "message": "Insufficient stake balance",
  "code": 3,
  "context": {
    "remediation": "Stake more tokens in the protocol before voting",
    "holder": "SP...",
    "required": "1000000",
    "available": "500000"
  },
  "timestamp": 1710777600000
}
```

## Best Practices

1. **Always check transaction validity before submission**
   ```typescript
   const tx = await client.transactions.buildVoteTransaction(...);
   if (!client.transactions.preflightCheck(tx)) {
     throw new Error('Transaction validation failed');
   }
   ```

2. **Include remediation suggestions in UI**
   ```typescript
   if (error instanceof ContractError && error.context.remediation) {
     showUserMessage(error.context.remediation);
   }
   ```

3. **Log errors with full context**
   ```typescript
   if (error instanceof ProtocolError) {
     logger.error('Protocol error occurred', error.toJSON());
   }
   ```

4. **Implement retry logic for network errors**
   ```typescript
   async function withRetry(fn, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error instanceof NetworkError && i < maxRetries - 1) {
           await delay(Math.pow(2, i) * 1000);
           continue;
         }
         throw error;
       }
     }
   }
   ```
