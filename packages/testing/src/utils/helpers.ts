/**
 * Test utilities and custom matchers
 */

import { expect } from 'vitest';

/**
 * Time manipulation utilities
 */
export class TimeHelper {
  private originalNow: () => number;

  constructor() {
    this.originalNow = Date.now;
  }

  freeze(timestamp?: number): void {
    const frozenTime = timestamp ?? Date.now();
    Date.now = () => frozenTime;
  }

  travel(ms: number): void {
    const current = Date.now();
    Date.now = () => current + ms;
  }

  restore(): void {
    Date.now = this.originalNow;
  }
}

/**
 * Mock blockchain data
 */
export class MockBlockchain {
  private currentBlock = 1000;
  private blockTime = 600000; // 10 minutes

  getCurrentBlock(): number {
    return this.currentBlock;
  }

  setCurrentBlock(block: number): void {
    this.currentBlock = block;
  }

  mineBlocks(count: number): void {
    this.currentBlock += count;
  }

  getBlockTime(block: number): number {
    return this.blockTime * (block - 1000);
  }

  reset(): void {
    this.currentBlock = 1000;
  }
}

/**
 * Async test helpers
 */
export class AsyncHelper {
  async waitFor<T>(
    fn: () => T | Promise<T>,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<T> {
    const timeout = options.timeout ?? 5000;
    const interval = options.interval ?? 100;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await fn();
        if (result) return result;
      } catch (error) {
        // Continue waiting
      }
      await this.sleep(interval);
    }

    throw new Error(`waitFor timeout after ${timeout}ms`);
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retry<T>(
    fn: () => Promise<T>,
    attempts: number = 3,
    delay: number = 100
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await this.sleep(delay);
      }
    }
    throw new Error('Retry exhausted');
  }
}

/**
 * Custom matchers for SF Protocol
 */
export const customMatchers = {
  toBeValidAddress(received: string): { pass: boolean; message: () => string } {
    const isValid = /^SP[0-9A-Z]{39}$/.test(received);
    return {
      pass: isValid,
      message: () => `Expected ${received} to be a valid Stacks address`,
    };
  },

  toBeValidProposal(received: any): { pass: boolean; message: () => string } {
    const hasRequiredFields = 
      received &&
      typeof received.id === 'number' &&
      typeof received.title === 'string' &&
      typeof received.creator === 'string' &&
      ['active', 'passed', 'rejected', 'executed'].includes(received.status);

    return {
      pass: hasRequiredFields,
      message: () => `Expected ${JSON.stringify(received)} to be a valid proposal`,
    };
  },

  toBeInRange(received: number, min: number, max: number): { pass: boolean; message: () => string } {
    const inRange = received >= min && received <= max;
    return {
      pass: inRange,
      message: () => `Expected ${received} to be between ${min} and ${max}`,
    };
  },

  toBeBigInt(received: any): { pass: boolean; message: () => string } {
    const isBigInt = typeof received === 'bigint';
    return {
      pass: isBigInt,
      message: () => `Expected ${received} to be a BigInt`,
    };
  },

  toBeCloseTo(received: number, expected: number, precision: number = 2): { 
    pass: boolean; 
    message: () => string 
  } {
    const diff = Math.abs(received - expected);
    const tolerance = Math.pow(10, -precision);
    const close = diff < tolerance;
    return {
      pass: close,
      message: () => `Expected ${received} to be close to ${expected} (precision: ${precision})`,
    };
  },
};

/**
 * Snapshot utilities
 */
export class SnapshotHelper {
  private snapshots = new Map<string, any>();

  save(key: string, value: any): void {
    this.snapshots.set(key, JSON.parse(JSON.stringify(value)));
  }

  restore(key: string): any {
    const snapshot = this.snapshots.get(key);
    return snapshot ? JSON.parse(JSON.stringify(snapshot)) : undefined;
  }

  clear(): void {
    this.snapshots.clear();
  }

  compare(key: string, current: any): boolean {
    const snapshot = this.snapshots.get(key);
    return JSON.stringify(snapshot) === JSON.stringify(current);
  }
}

/**
 * Test setup helpers
 */
export function setupTestEnvironment() {
  const time = new TimeHelper();
  const blockchain = new MockBlockchain();
  const async = new AsyncHelper();
  const snapshot = new SnapshotHelper();

  return {
    time,
    blockchain,
    async,
    snapshot,
    cleanup: () => {
      time.restore();
      blockchain.reset();
      snapshot.clear();
    },
  };
}

// Global instances
const globalTimeHelper = new TimeHelper();
const globalBlockchain = new MockBlockchain();
const globalAsyncHelper = new AsyncHelper();
const globalSnapshotHelper = new SnapshotHelper();

export {
  globalTimeHelper,
  globalBlockchain,
  globalAsyncHelper,
  globalSnapshotHelper,
};
