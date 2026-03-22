/**
 * Test fixture factories for SF Protocol entities
 */

export interface ProposalFixture {
  id: number;
  title: string;
  description: string;
  creator: string;
  amount: bigint;
  category: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: bigint;
  votesAgainst: bigint;
  startBlock: number;
  endBlock: number;
}

export interface VoteFixture {
  proposalId: number;
  voter: string;
  weight: number;
  choice: 'for' | 'against';
  timestamp: number;
}

export interface StakeFixture {
  address: string;
  amount: bigint;
  lockedUntil: number;
  delegatedTo?: string;
}

/**
 * Factory for generating test proposals
 */
export class ProposalFactory {
  private counter = 1;

  create(overrides?: Partial<ProposalFixture>): ProposalFixture {
    const id = overrides?.id ?? this.counter++;
    return {
      id,
      title: `Proposal ${id}`,
      description: `Test proposal description for ${id}`,
      creator: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      amount: BigInt(100000000),
      category: 'development',
      status: 'active',
      votesFor: BigInt(0),
      votesAgainst: BigInt(0),
      startBlock: 1000,
      endBlock: 2000,
      ...overrides,
    };
  }

  createBatch(count: number, overrides?: Partial<ProposalFixture>): ProposalFixture[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  createActive(overrides?: Partial<ProposalFixture>): ProposalFixture {
    return this.create({ status: 'active', ...overrides });
  }

  createPassed(overrides?: Partial<ProposalFixture>): ProposalFixture {
    return this.create({
      status: 'passed',
      votesFor: BigInt(1000000),
      votesAgainst: BigInt(100000),
      ...overrides,
    });
  }

  createRejected(overrides?: Partial<ProposalFixture>): ProposalFixture {
    return this.create({
      status: 'rejected',
      votesFor: BigInt(100000),
      votesAgainst: BigInt(1000000),
      ...overrides,
    });
  }

  reset(): void {
    this.counter = 1;
  }
}

/**
 * Factory for generating test votes
 */
export class VoteFactory {
  create(overrides?: Partial<VoteFixture>): VoteFixture {
    return {
      proposalId: 1,
      voter: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      weight: 10,
      choice: 'for',
      timestamp: Date.now(),
      ...overrides,
    };
  }

  createBatch(count: number, overrides?: Partial<VoteFixture>): VoteFixture[] {
    return Array.from({ length: count }, (_, i) => this.create({
      voter: `SP${i.toString().padStart(40, '0')}`,
      ...overrides,
    }));
  }

  createFor(proposalId: number, overrides?: Partial<VoteFixture>): VoteFixture {
    return this.create({ proposalId, choice: 'for', ...overrides });
  }

  createAgainst(proposalId: number, overrides?: Partial<VoteFixture>): VoteFixture {
    return this.create({ proposalId, choice: 'against', ...overrides });
  }
}

/**
 * Factory for generating test stakes
 */
export class StakeFactory {
  create(overrides?: Partial<StakeFixture>): StakeFixture {
    return {
      address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      amount: BigInt(1000000),
      lockedUntil: Date.now() + 86400000,
      ...overrides,
    };
  }

  createBatch(count: number, overrides?: Partial<StakeFixture>): StakeFixture[] {
    return Array.from({ length: count }, (_, i) => this.create({
      address: `SP${i.toString().padStart(40, '0')}`,
      ...overrides,
    }));
  }

  createLocked(duration: number, overrides?: Partial<StakeFixture>): StakeFixture {
    return this.create({
      lockedUntil: Date.now() + duration,
      ...overrides,
    });
  }

  createDelegated(delegateTo: string, overrides?: Partial<StakeFixture>): StakeFixture {
    return this.create({
      delegatedTo: delegateTo,
      ...overrides,
    });
  }
}

/**
 * Composite fixture builder
 */
export class FixtureBuilder {
  proposals = new ProposalFactory();
  votes = new VoteFactory();
  stakes = new StakeFactory();

  reset(): void {
    this.proposals.reset();
  }
}

// Global instances
const globalProposalFactory = new ProposalFactory();
const globalVoteFactory = new VoteFactory();
const globalStakeFactory = new StakeFactory();
const globalFixtureBuilder = new FixtureBuilder();

export function createProposalFactory(): ProposalFactory {
  return new ProposalFactory();
}

export function createVoteFactory(): VoteFactory {
  return new VoteFactory();
}

export function createStakeFactory(): StakeFactory {
  return new StakeFactory();
}

export function createFixtureBuilder(): FixtureBuilder {
  return new FixtureBuilder();
}

export {
  globalProposalFactory,
  globalVoteFactory,
  globalStakeFactory,
  globalFixtureBuilder,
};
