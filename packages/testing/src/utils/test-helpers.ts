/**
 * Test Helper Utilities
 * 
 * Common utilities for simplifying test writing.
 */

import { Proposal, Vote, StakeBalance, Principal, BigIntString } from '@sf-protocol/core';

/**
 * Assert proposal has expected properties
 */
export function assertProposal(
  proposal: Proposal,
  expected: Partial<Proposal>
): void {
  for (const [key, value] of Object.entries(expected)) {
    const actual = (proposal as any)[key];
    if (JSON.stringify(actual) !== JSON.stringify(value)) {
      throw new Error(
        `Proposal ${key} mismatch: expected ${JSON.stringify(value)}, got ${JSON.stringify(actual)}`
      );
    }
  }
}

/**
 * Assert vote has expected properties
 */
export function assertVote(vote: Vote, expected: Partial<Vote>): void {
  for (const [key, value] of Object.entries(expected)) {
    const actual = (vote as any)[key];
    if (JSON.stringify(actual) !== JSON.stringify(value)) {
      throw new Error(
        `Vote ${key} mismatch: expected ${JSON.stringify(value)}, got ${JSON.stringify(actual)}`
      );
    }
  }
}

/**
 * Assert stake balance is within expected range
 */
export function assertStakeBalance(
  balance: StakeBalance,
  minStaked: number,
  maxStaked: number
): void {
  const staked = BigInt(balance.staked);
  const min = BigInt(minStaked);
  const max = BigInt(maxStaked);

  if (staked < min || staked > max) {
    throw new Error(
      `Stake balance ${staked} out of range [${min}, ${max}]`
    );
  }
}

/**
 * Create a voter with specific stake
 */
export function createVoter(
  address: string,
  stake: number
): [string, StakeBalance] {
  const staked = BigInt(stake);
  const votingPower = BigInt(Math.floor(Math.sqrt(stake)));

  return [
    address,
    {
      address: address as Principal,
      staked: staked.toString() as BigIntString,
      votingPower: votingPower.toString() as BigIntString,
      locked: '0' as BigIntString,
      available: staked.toString() as BigIntString,
      lastUpdated: Date.now()
    }
  ];
}

/**
 * Compare two proposals for equality (ignoring timestamps)
 */
export function proposalsEqual(a: Proposal, b: Proposal): boolean {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.description === b.description &&
    a.creator === b.creator &&
    a.fundingGoal === b.fundingGoal &&
    a.currentRaised === b.currentRaised &&
    a.status === b.status
  );
}

/**
 * Compare two votes for equality (ignoring timestamps)
 */
export function votesEqual(a: Vote, b: Vote): boolean {
  return (
    a.proposalId === b.proposalId &&
    a.voter === b.voter &&
    a.weight === b.weight &&
    a.support === b.support
  );
}

/**
 * Wait for condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Create mock error
 */
export function createMockError(message: string): Error {
  const error = new Error(message);
  error.stack = `Error: ${message}\n    at test (file:///test.ts:1:1)`;
  return error;
}

/**
 * Track function calls
 */
export class CallTracker {
  private calls: Array<{ args: any[]; result?: any; error?: Error; timestamp: number }> = [];

  /**
   * Track a function call
   */
  track<T>(fn: (...args: any[]) => T, ...args: any[]): T {
    const timestamp = Date.now();

    try {
      const result = fn(...args);
      this.calls.push({ args, result, timestamp });
      return result;
    } catch (error) {
      this.calls.push({
        args,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp
      });
      throw error;
    }
  }

  /**
   * Track an async function call
   */
  async trackAsync<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
    const timestamp = Date.now();

    try {
      const result = await fn(...args);
      this.calls.push({ args, result, timestamp });
      return result;
    } catch (error) {
      this.calls.push({
        args,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp
      });
      throw error;
    }
  }

  /**
   * Get all calls
   */
  getCalls() {
    return this.calls;
  }

  /**
   * Get call count
   */
  getCallCount(): number {
    return this.calls.length;
  }

  /**
   * Get successful calls
   */
  getSuccessfulCalls() {
    return this.calls.filter(c => !c.error);
  }

  /**
   * Get failed calls
   */
  getFailedCalls() {
    return this.calls.filter(c => c.error);
  }

  /**
   * Clear calls
   */
  clear(): void {
    this.calls = [];
  }
}

/**
 * Create a time mock
 */
export class TimeMock {
  private currentTime: number;

  constructor(startTime: number = Date.now()) {
    this.currentTime = startTime;
  }

  /**
   * Get current time
   */
  now(): number {
    return this.currentTime;
  }

  /**
   * Advance time
   */
  advance(ms: number): void {
    this.currentTime += ms;
  }

  /**
   * Set time to specific value
   */
  set(time: number): void {
    this.currentTime = time;
  }

  /**
   * Reset to start
   */
  reset(): void {
    this.currentTime = Date.now();
  }
}
