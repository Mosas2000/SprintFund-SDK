/**
 * Test fixtures for governance data
 */

export interface ProposalFixture {
  id: number;
  title: string;
  description: string;
  amount: bigint;
  creator: string;
  votesFor: bigint;
  votesAgainst: bigint;
  status: 'active' | 'passed' | 'rejected' | 'executed' | 'pending';
  createdAt: bigint;
  executedAt?: bigint;
}

export interface VoteFixture {
  proposalId: number;
  voter: string;
  choice: boolean;
  weight: number;
  votedAt: bigint;
}

export interface StakeFixture {
  address: string;
  amount: bigint;
  stakedAt: bigint;
}

// Sample addresses
export const ADDRESSES = {
  alice: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  bob: 'SP3FGQ8Z7JY9BWYZ5WM53E0M9NK7WHJF0691NZ159',
  charlie: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
  treasury: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
};

// Proposal fixtures
export const PROPOSALS: ProposalFixture[] = [
  {
    id: 0,
    title: 'Community Fund Allocation',
    description: 'Allocate 10,000 STX from treasury to community development initiatives including hackathons, educational content, and developer grants.',
    amount: 10000000000n, // 10,000 STX
    creator: ADDRESSES.alice,
    votesFor: 500000000n,
    votesAgainst: 100000000n,
    status: 'active',
    createdAt: BigInt(Date.now() - 86400000 * 2),
  },
  {
    id: 1,
    title: 'Protocol Parameter Update',
    description: 'Update the voting period from 144 blocks to 288 blocks to allow more time for community deliberation.',
    amount: 0n,
    creator: ADDRESSES.bob,
    votesFor: 800000000n,
    votesAgainst: 200000000n,
    status: 'passed',
    createdAt: BigInt(Date.now() - 86400000 * 7),
  },
  {
    id: 2,
    title: 'Marketing Campaign Budget',
    description: 'Fund a comprehensive marketing campaign across social media platforms.',
    amount: 5000000000n, // 5,000 STX
    creator: ADDRESSES.charlie,
    votesFor: 150000000n,
    votesAgainst: 350000000n,
    status: 'rejected',
    createdAt: BigInt(Date.now() - 86400000 * 14),
  },
  {
    id: 3,
    title: 'Security Audit Funding',
    description: 'Commission a third-party security audit of the smart contracts.',
    amount: 20000000000n, // 20,000 STX
    creator: ADDRESSES.alice,
    votesFor: 900000000n,
    votesAgainst: 50000000n,
    status: 'executed',
    createdAt: BigInt(Date.now() - 86400000 * 30),
    executedAt: BigInt(Date.now() - 86400000 * 20),
  },
  {
    id: 4,
    title: 'Governance Token Distribution',
    description: 'Distribute governance tokens to early contributors and active community members.',
    amount: 0n,
    creator: ADDRESSES.bob,
    votesFor: 0n,
    votesAgainst: 0n,
    status: 'pending',
    createdAt: BigInt(Date.now() - 3600000),
  },
];

// Vote fixtures
export const VOTES: VoteFixture[] = [
  { proposalId: 0, voter: ADDRESSES.alice, choice: true, weight: 5, votedAt: BigInt(Date.now() - 86400000) },
  { proposalId: 0, voter: ADDRESSES.bob, choice: true, weight: 3, votedAt: BigInt(Date.now() - 43200000) },
  { proposalId: 0, voter: ADDRESSES.charlie, choice: false, weight: 2, votedAt: BigInt(Date.now() - 21600000) },
  { proposalId: 1, voter: ADDRESSES.alice, choice: true, weight: 4, votedAt: BigInt(Date.now() - 86400000 * 5) },
  { proposalId: 1, voter: ADDRESSES.bob, choice: true, weight: 6, votedAt: BigInt(Date.now() - 86400000 * 4) },
  { proposalId: 1, voter: ADDRESSES.charlie, choice: false, weight: 2, votedAt: BigInt(Date.now() - 86400000 * 3) },
];

// Stake fixtures
export const STAKES: StakeFixture[] = [
  { address: ADDRESSES.alice, amount: 100000000000n, stakedAt: BigInt(Date.now() - 86400000 * 60) }, // 100,000 STX
  { address: ADDRESSES.bob, amount: 50000000000n, stakedAt: BigInt(Date.now() - 86400000 * 45) }, // 50,000 STX
  { address: ADDRESSES.charlie, amount: 25000000000n, stakedAt: BigInt(Date.now() - 86400000 * 30) }, // 25,000 STX
];

// Governance config
export const GOVERNANCE_CONFIG = {
  proposalThreshold: 1000000000n, // 1,000 STX
  quorumThreshold: 100000000000n, // 100,000 STX
  votingPeriod: 144n, // ~1 day in blocks
  executionDelay: 6n, // ~1 hour in blocks
};

// Factory functions
export function createProposal(overrides?: Partial<ProposalFixture>): ProposalFixture {
  return {
    id: Math.floor(Math.random() * 1000),
    title: 'Test Proposal',
    description: 'This is a test proposal for development purposes.',
    amount: 1000000000n,
    creator: ADDRESSES.alice,
    votesFor: 0n,
    votesAgainst: 0n,
    status: 'active',
    createdAt: BigInt(Date.now()),
    ...overrides,
  };
}

export function createVote(overrides?: Partial<VoteFixture>): VoteFixture {
  return {
    proposalId: 0,
    voter: ADDRESSES.alice,
    choice: true,
    weight: 1,
    votedAt: BigInt(Date.now()),
    ...overrides,
  };
}

export function createStake(overrides?: Partial<StakeFixture>): StakeFixture {
  return {
    address: ADDRESSES.alice,
    amount: 10000000000n,
    stakedAt: BigInt(Date.now()),
    ...overrides,
  };
}

// Random data generators
export function randomAddress(): string {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let addr = 'SP';
  for (let i = 0; i < 38; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export function randomProposals(count: number): ProposalFixture[] {
  const statuses: ProposalFixture['status'][] = ['active', 'passed', 'rejected', 'executed', 'pending'];
  return Array.from({ length: count }, (_, i) =>
    createProposal({
      id: i,
      title: `Proposal #${i}: ${['Funding', 'Update', 'Grant', 'Change'][i % 4]} Request`,
      status: statuses[i % statuses.length],
      votesFor: BigInt(Math.floor(Math.random() * 1000000000)),
      votesAgainst: BigInt(Math.floor(Math.random() * 500000000)),
    })
  );
}
