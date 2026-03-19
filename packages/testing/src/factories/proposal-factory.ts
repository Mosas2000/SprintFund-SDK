/**
 * Factory Functions for Test Data
 * 
 * Generate test data with customizable properties.
 */

import { Proposal, Vote, StakeBalance, Principal, BigIntString } from '@sf-protocol/core';
import { testAddresses } from '../fixtures/proposals';

/**
 * Proposal factory
 */
export class ProposalFactory {
  static create(overrides?: Partial<Proposal>): Proposal {
    const id = Math.floor(Math.random() * 10000);
    
    return {
      id,
      title: `Proposal ${id}`,
      description: 'Test proposal description',
      creator: testAddresses.alice,
      fundingGoal: '1000000' as BigIntString,
      currentRaised: '0' as BigIntString,
      votingStartBlock: 1000 + id,
      votingEndBlock: 2000 + id,
      executionStartBlock: 2100 + id,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides
    } as Proposal;
  }

  static createBatch(count: number, overrides?: Partial<Proposal>): Proposal[] {
    return Array.from({ length: count }, (_, i) =>
      ProposalFactory.create({
        id: i + 1,
        ...overrides
      })
    );
  }

  static withStatus(status: string): Proposal {
    return ProposalFactory.create({ status: status as any });
  }

  static fullyFunded(): Proposal {
    return ProposalFactory.create({
      fundingGoal: '1000000' as BigIntString,
      currentRaised: '1000000' as BigIntString,
      status: 'executing'
    });
  }

  static highGoal(): Proposal {
    return ProposalFactory.create({
      fundingGoal: '10000000' as BigIntString,
      currentRaised: '5000000' as BigIntString
    });
  }
}

/**
 * Vote factory
 */
export class VoteFactory {
  static create(overrides?: Partial<Vote>): Vote {
    const id = Math.floor(Math.random() * 10000);
    const weight = BigInt(Math.floor(Math.random() * 10000) + 1);

    return {
      id,
      proposalId: 1,
      voter: testAddresses.alice,
      weight: weight.toString() as BigIntString,
      support: Math.random() > 0.5,
      voteCost: (weight * weight).toString() as BigIntString,
      timestamp: Date.now(),
      ...overrides
    } as Vote;
  }

  static createBatch(count: number, proposalId: number = 1, overrides?: Partial<Vote>): Vote[] {
    return Array.from({ length: count }, (_, i) =>
      VoteFactory.create({
        id: i + 1,
        proposalId,
        voter: Object.values(testAddresses)[i % Object.keys(testAddresses).length],
        ...overrides
      })
    );
  }

  static inFavor(): Vote {
    return VoteFactory.create({
      support: true,
      weight: '1000' as BigIntString
    });
  }

  static against(): Vote {
    return VoteFactory.create({
      support: false,
      weight: '500' as BigIntString
    });
  }

  static highWeight(): Vote {
    const weight = BigInt(100000);
    return VoteFactory.create({
      weight: weight.toString() as BigIntString,
      voteCost: (weight * weight).toString() as BigIntString
    });
  }
}

/**
 * Stake balance factory
 */
export class StakeBalanceFactory {
  static create(overrides?: Partial<StakeBalance>): StakeBalance {
    const staked = BigInt(Math.floor(Math.random() * 1000000) + 1000);

    return {
      address: testAddresses.alice,
      staked: staked.toString() as BigIntString,
      votingPower: (BigInt(Math.floor(Math.sqrt(Number(staked))))).toString() as BigIntString,
      locked: '0' as BigIntString,
      available: staked.toString() as BigIntString,
      lastUpdated: Date.now(),
      ...overrides
    } as StakeBalance;
  }

  static createBatch(count: number, overrides?: Partial<StakeBalance>): Array<[string, StakeBalance]> {
    return Array.from({ length: count }, (_, i) => {
      const address = Object.values(testAddresses)[i % Object.keys(testAddresses).length];
      const staked = BigInt(Math.floor(Math.random() * 1000000) + 1000);

      return [
        address,
        {
          address,
          staked: staked.toString() as BigIntString,
          votingPower: (BigInt(Math.floor(Math.sqrt(Number(staked))))).toString() as BigIntString,
          locked: '0' as BigIntString,
          available: staked.toString() as BigIntString,
          lastUpdated: Date.now(),
          ...overrides
        } as StakeBalance
      ];
    });
  }

  static withAmount(amount: number): StakeBalance {
    const staked = BigInt(amount);
    return StakeBalanceFactory.create({
      staked: staked.toString() as BigIntString,
      available: staked.toString() as BigIntString,
      votingPower: (BigInt(Math.floor(Math.sqrt(amount)))).toString() as BigIntString
    });
  }

  static locked(): StakeBalance {
    return StakeBalanceFactory.create({
      locked: '500000' as BigIntString,
      available: '500000' as BigIntString
    });
  }
}
