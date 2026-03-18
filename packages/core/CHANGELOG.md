# @sf-protocol/core CHANGELOG

## [0.1.0] - 2025-03-18

### Added

**Core Features**
- Complete TypeScript SDK for SprintFund governance protocol
- Full type safety with strict TypeScript compiler options
- Support for Stacks mainnet, testnet, and devnet networks

**Contract Client**
- Typed client for `SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3`
- Read-only methods for proposals, stakes, and voting data
- Automatic in-memory caching with TTL support
- Network configuration management

**Quadratic Voting**
- Vote cost calculation: `cost = weight^2`
- Maximum weight computation: `maxWeight = floor(sqrt(stake))`
- Remaining voting power tracking
- Validation functions for parameters and constraints

**Transaction Building**
- Pre-validated transaction construction
- Support for stake deposits/withdrawals
- Proposal creation with parameter validation
- Vote submission with cost verification
- Proposal execution transactions
- Comprehensive error handling with remediation guidance

**Error Handling**
- Custom error classes: `ProtocolError`, `ContractError`, `NetworkError`, `ValidationError`
- Contract error code to message mapping
- Human-readable remediation suggestions
- Full error context and stack preservation
- JSON serialization for logging

**Utilities**
- Clarity value parser for safe type conversion
- Type guards for runtime type checking
- Simple in-memory cache with pattern invalidation
- Address and principal validation

### Testing
- 80%+ code coverage with Vitest
- Comprehensive unit tests for all modules
- Integration tests for full workflows
- Math and validation edge case coverage
- Error handling and recovery tests

### Documentation
- Detailed README with installation and quick start
- API reference with all public methods
- Usage examples for common workflows
- Error code reference with remediation strategies

---

## [0.0.0] - Initial Setup

Project structure initialized with monorepo configuration
