# @sf-protocol/indexer

PostgreSQL-backed blockchain indexer with REST and GraphQL APIs for SprintFund governance protocol.

## Features

- 🔗 **Blockchain Indexer** - Resumable sync worker with checkpoint management
- 📊 **Analytics** - Materialized views for governance metrics
- 🔌 **REST API** - Paginated endpoints for proposals, votes, and stakes
- 📈 **GraphQL API** - Flexible query interface with DataLoader optimization
- 🪝 **Webhooks** - Real-time event notifications with retry logic
- 🐘 **PostgreSQL** - Normalized schema with full-text search
- 🐳 **Docker** - Docker Compose setup for local development

## Quick Start

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d

# Run migrations
npm run db:migrate

# Start indexer
npm run dev
```

## API Endpoints

### REST API

- `GET /api/proposals` - List proposals
- `GET /api/proposals/:id` - Get proposal details
- `GET /api/votes/:proposalId` - Get proposal votes
- `GET /api/analytics` - Get governance analytics

### GraphQL API

```graphql
query {
  proposals(limit: 10, offset: 0) {
    id
    title
    status
    fundingGoal
    fundingRaised
  }
  
  voting_power(voter: "SP...") {
    maxWeight
    available
    currentUsed
  }
}
```

## Database Schema

Tables:
- `proposals` - Governance proposals
- `votes` - Individual votes
- `participants` - Governance actors
- `stakes` - Stake balances
- `executions` - Proposal results
- `webhooks` - Event subscriptions

## Configuration

Create `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/sprintfund
CORE_API_URL=https://api.mainnet.hiro.so
REDIS_URL=redis://localhost:6379
```

## Development

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Run tests
npm test

# Build
npm run build
```

## License

MIT © 2025 SF Protocol Contributors
