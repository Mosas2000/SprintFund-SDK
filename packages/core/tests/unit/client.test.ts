import { describe, it, expect } from 'vitest';
import { SprintFundClient, createClient } from '../src/client/sprintfund.js';

describe('SprintFundClient', () => {
  it('should create client with mainnet by default', () => {
    const client = new SprintFundClient();
    expect(client.getNetwork()).toBe('mainnet');
  });

  it('should create client with custom network', () => {
    const client = new SprintFundClient('testnet');
    expect(client.getNetwork()).toBe('testnet');
  });

  it('should initialize all sub-clients', () => {
    const client = new SprintFundClient();
    expect(client.proposals).toBeDefined();
    expect(client.stakes).toBeDefined();
    expect(client.voting).toBeDefined();
    expect(client.transactions).toBeDefined();
  });

  it('should provide factory function', () => {
    const client = createClient('devnet');
    expect(client.getNetwork()).toBe('devnet');
  });

  it('should clear all caches', () => {
    const client = new SprintFundClient();
    expect(() => client.clearCaches()).not.toThrow();
  });
});
