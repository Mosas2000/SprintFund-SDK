# @sf-protocol/cli

Command-line interface for SF Protocol SDK development.

## Installation

```bash
npm install -g @sf-protocol/cli
```

Or use with npx:

```bash
npx @sf-protocol/cli init
```

## Commands

### `init` - Initialize a new project

Create a new SF Protocol project with interactive prompts.

```bash
sf-protocol init
# or
sfp init

# With options
sf-protocol init --name my-app --template next --package-manager npm
```

**Options:**
- `-n, --name <name>` - Project name
- `-t, --template <template>` - Project template (next, vite, node)
- `-pm, --package-manager <manager>` - Package manager (npm, yarn, pnpm)
- `--skip-install` - Skip dependency installation

**Templates:**
- `next` - Next.js application (recommended for web apps)
- `vite` - Vite + React application (lightweight SPA)
- `node` - Node.js backend/scripts

**Features:**
- Wallet integration (Hiro, Leather)
- Analytics dashboard components
- Testing setup with Vitest
- ESLint configuration
- Prettier configuration

### `generate` - Generate code from templates

Generate boilerplate code for common patterns.

```bash
sf-protocol generate
# or
sfp g

# With options
sf-protocol generate --type proposal --name MyProposal --output ./src
```

**Options:**
- `-t, --type <type>` - Generation type (proposal, vote, stake, hook, component)
- `-n, --name <name>` - Component/function name
- `-o, --output <path>` - Output directory

**Generation Types:**
- `proposal` - Proposal creation logic
- `vote` - Voting logic
- `stake` - Staking logic
- `hook` - Custom React hook
- `component` - React component

## Examples

### Create a Next.js project

```bash
sf-protocol init --name my-governance-app --template next
cd my-governance-app
npm run dev
```

### Generate proposal logic

```bash
sf-protocol generate --type proposal --name CommunityFunding
```

This generates a service class with methods for creating and querying proposals.

### Generate a custom hook

```bash
sf-protocol generate --type hook --name ProposalStats
```

This creates a React Query hook with the proper setup.

## Global Options

- `-v, --version` - Display CLI version
- `-h, --help` - Display help information

## Environment Variables

- `DEBUG=true` - Enable debug logging

## Development

```bash
# Clone and install
git clone https://github.com/sf-protocol/sdk.git
cd sdk/packages/cli
npm install

# Run in development
npm run dev

# Build
npm run build

# Test
npm test
```

## Support

- Documentation: https://sf-protocol.github.io/sdk
- Issues: https://github.com/sf-protocol/sdk/issues
- Discord: https://discord.gg/sf-protocol

## License

MIT © SF Protocol Team
