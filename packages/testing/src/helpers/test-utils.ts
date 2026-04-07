/**
 * Test helpers and utilities
 */

import { MockContractExecutor } from '../mocks/contract-executor';
import { MockWalletAdapter } from '../mocks/wallet-adapter';
import { PROPOSALS, STAKES, VOTES, GOVERNANCE_CONFIG } from '../fixtures/governance';

// Timing helpers
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitFor<T>(
  fn: () => T | Promise<T>,
  options: { timeout?: number; interval?: number } = {}
): Promise<T> {
  const { timeout = 5000, interval = 50 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const result = await fn();
      if (result) return result;
    } catch {
      // Continue waiting
    }
    await wait(interval);
  }

  throw new Error(`waitFor timed out after ${timeout}ms`);
}

export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  await waitFor(async () => {
    const result = await condition();
    return result ? true : undefined;
  }, options);
}

// Mock setup helpers
export interface TestContext {
  executor: MockContractExecutor;
  wallet: MockWalletAdapter;
  cleanup: () => void;
}

export function createTestContext(options?: {
  preloadFixtures?: boolean;
  walletConnected?: boolean;
}): TestContext {
  const executor = new MockContractExecutor();
  const wallet = new MockWalletAdapter();

  if (options?.preloadFixtures) {
    // Load proposals
    PROPOSALS.forEach((p) => executor.addProposal(p));

    // Load stakes
    STAKES.forEach((s) => executor.setStake(s.address, s.amount));

    // Load votes
    VOTES.forEach((v) => executor.addVote(v.proposalId, v));
  }

  if (options?.walletConnected) {
    wallet.connect();
  }

  return {
    executor,
    wallet,
    cleanup: () => {
      executor.reset();
      wallet.reset();
    },
  };
}

// Assertion helpers
export function assertBigInt(actual: bigint, expected: bigint, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${expected.toString()}, got ${actual.toString()}`
    );
  }
}

export function assertDeepEqual<T>(actual: T, expected: T, message?: string): void {
  const actualStr = JSON.stringify(actual, bigIntReplacer);
  const expectedStr = JSON.stringify(expected, bigIntReplacer);
  if (actualStr !== expectedStr) {
    throw new Error(
      message || `Deep equality failed:\nActual: ${actualStr}\nExpected: ${expectedStr}`
    );
  }
}

function bigIntReplacer(_key: string, value: any): any {
  return typeof value === 'bigint' ? value.toString() : value;
}

// Event tracking helper
export class EventTracker<T = any> {
  private events: { name: string; data: T; timestamp: number }[] = [];

  track(name: string, data: T): void {
    this.events.push({ name, data, timestamp: Date.now() });
  }

  getEvents(name?: string): { name: string; data: T; timestamp: number }[] {
    if (name) {
      return this.events.filter((e) => e.name === name);
    }
    return [...this.events];
  }

  getLastEvent(name?: string): { name: string; data: T; timestamp: number } | undefined {
    const events = this.getEvents(name);
    return events[events.length - 1];
  }

  clear(): void {
    this.events = [];
  }

  count(name?: string): number {
    return this.getEvents(name).length;
  }

  waitForEvent(name: string, timeout = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        const event = this.getLastEvent(name);
        if (event && event.timestamp > start) {
          resolve(event.data);
          return;
        }
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for event: ${name}`));
          return;
        }
        setTimeout(check, 50);
      };
      check();
    });
  }
}

// Snapshot helpers for state comparison
export function createSnapshot<T>(state: T): string {
  return JSON.stringify(state, bigIntReplacer, 2);
}

export function compareSnapshots(before: string, after: string): {
  changed: boolean;
  diff: string[];
} {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const diff: string[] = [];

  const maxLines = Math.max(beforeLines.length, afterLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (beforeLines[i] !== afterLines[i]) {
      if (beforeLines[i]) diff.push(`- ${beforeLines[i]}`);
      if (afterLines[i]) diff.push(`+ ${afterLines[i]}`);
    }
  }

  return { changed: diff.length > 0, diff };
}

// Mock timer control
export class MockTimer {
  private time: number = 0;
  private timers: { id: number; callback: () => void; at: number }[] = [];
  private nextId = 1;

  now(): number {
    return this.time;
  }

  advance(ms: number): void {
    const targetTime = this.time + ms;
    while (this.timers.length > 0) {
      const next = this.timers[0];
      if (next.at > targetTime) break;
      this.time = next.at;
      this.timers.shift();
      next.callback();
    }
    this.time = targetTime;
  }

  setTimeout(callback: () => void, delay: number): number {
    const id = this.nextId++;
    const at = this.time + delay;
    this.timers.push({ id, callback, at });
    this.timers.sort((a, b) => a.at - b.at);
    return id;
  }

  clearTimeout(id: number): void {
    this.timers = this.timers.filter((t) => t.id !== id);
  }

  reset(): void {
    this.time = 0;
    this.timers = [];
    this.nextId = 1;
  }
}
