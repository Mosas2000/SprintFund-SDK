# SF Protocol SDK

Complete TypeScript SDK for SprintFund governance protocol on Stacks blockchain.

## 🚀 Features

- **@sf-protocol/core** - Type-safe contract client with read operations and transaction builders
- **@sf-protocol/react** - React hooks for seamless UI integration with wallet support
- **@sf-protocol/indexer** - PostgreSQL indexer with REST and GraphQL APIs for analytics

## 📋 Requirements

- Node.js 20.x LTS or later
- npm 10.x or later
- Git 2.x or later

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Run tests across all packages
npm test

# Build all packages
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📦 Packages

### @sf-protocol/core

Core contract client for SprintFund governance protocol.

```bash
npm install @sf-protocol/core
```

**Features:**
- Typed contract client for sprintfund-core-v3
- Read-only methods for proposals, stakes, and voting
- Transaction builders with validation
- Quadratic voting mathematics
- Comprehensive error handling

### @sf-protocol/react

React hooks and components for UI integration.

```bash
npm install @sf-protocol/react
```

**Features:**
- useProposal, useProposals, useStake hooks
- useVote, useCreateProposal transaction hooks
- Wallet integration with Hiro and Leather
- Optimistic UI patterns
- Real-time data synchronization

### @sf-protocol/indexer

PostgreSQL-backed indexer with REST and GraphQL APIs.

```bash
cd packages/indexer
npm install
```

**Features:**
- Blockchain event indexing
- Materialized analytics
- REST API with pagination
- GraphQL API with DataLoader
- Webhook system for real-time events

## 🔗 Contract Details

- **Contract ID**: `SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3`
- **Network**: Stacks Mainnet
- **Type**: Clarity smart contract

## 📚 Documentation

- [Core SDK Documentation](./packages/core/README.md)
- [React Hooks Documentation](./packages/react/README.md)
- [Indexer Documentation](./packages/indexer/README.md)

## 🧪 Testing

All packages use Vitest for testing with minimum 80% code coverage:

```bash
# Run tests
npm test

# With coverage report
npm run test:coverage

# Watch mode
npm test -- --watch
```

## 🏗️ Project Structure

```
sf-protocol/
├── packages/
│   ├── core/           # Core SDK
│   ├── react/          # React hooks
│   └── indexer/        # Indexer service
├── examples/
│   ├── next-app/       # Next.js example
│   └── node-script/    # Node.js example
├── docs/               # Documentation site
└── tsconfig.base.json  # Shared TypeScript config
```

## 🔄 Git Workflow

- Branch naming: `feat/*`, `fix/*`, `docs/*`, `chore/*`, `test/*`
- Commits: Conventional commit format with descriptive messages
- Merging: Always use `--no-ff` to preserve branch history

## 📄 License

MIT © 2025 SF Protocol Contributors

## 🤝 Contributing

This is a reference implementation for the SF Protocol SDK. Contributions welcome!

## 📞 Support

For issues and questions, please open a GitHub issue.
