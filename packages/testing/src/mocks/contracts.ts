/**
 * Mock contract clients for testing
 */

export interface MockCallOptions {
  shouldFail?: boolean;
  delay?: number;
  customResponse?: any;
}

/**
 * Mock SprintFund contract client
 */
export class MockSprintFundClient {
  private proposals = new Map<number, any>();
  private votes = new Map<string, any>();
  private stakes = new Map<string, bigint>();
  private callHistory: Array<{ method: string; args: any[] }> = [];

  async getProposal(id: number, options?: MockCallOptions): Promise<any> {
    this.recordCall('getProposal', [id]);
    
    if (options?.delay) await this.delay(options.delay);
    if (options?.shouldFail) throw new Error('Mock failure');
    if (options?.customResponse) return options.customResponse;

    return this.proposals.get(id) ?? null;
  }

  async createProposal(data: any, options?: MockCallOptions): Promise<number> {
    this.recordCall('createProposal', [data]);
    
    if (options?.delay) await this.delay(options.delay);
    if (options?.shouldFail) throw new Error('Mock failure');

    const id = this.proposals.size + 1;
    this.proposals.set(id, { id, ...data });
    return id;
  }

  async vote(proposalId: number, choice: 'for' | 'against', weight: number, options?: MockCallOptions): Promise<void> {
    this.recordCall('vote', [proposalId, choice, weight]);
    
    if (options?.delay) await this.delay(options.delay);
    if (options?.shouldFail) throw new Error('Mock failure');

    const key = `${proposalId}-${Date.now()}`;
    this.votes.set(key, { proposalId, choice, weight });
  }

  async stake(address: string, amount: bigint, options?: MockCallOptions): Promise<void> {
    this.recordCall('stake', [address, amount]);
    
    if (options?.delay) await this.delay(options.delay);
    if (options?.shouldFail) throw new Error('Mock failure');

    const current = this.stakes.get(address) ?? BigInt(0);
    this.stakes.set(address, current + amount);
  }

  async getStake(address: string, options?: MockCallOptions): Promise<bigint> {
    this.recordCall('getStake', [address]);
    
    if (options?.delay) await this.delay(options.delay);
    if (options?.shouldFail) throw new Error('Mock failure');

    return this.stakes.get(address) ?? BigInt(0);
  }

  getCallHistory(): Array<{ method: string; args: any[] }> {
    return [...this.callHistory];
  }

  getCallCount(method: string): number {
    return this.callHistory.filter(call => call.method === method).length;
  }

  wasCalledWith(method: string, args: any[]): boolean {
    return this.callHistory.some(
      call => call.method === method && JSON.stringify(call.args) === JSON.stringify(args)
    );
  }

  reset(): void {
    this.proposals.clear();
    this.votes.clear();
    this.stakes.clear();
    this.callHistory = [];
  }

  private recordCall(method: string, args: any[]): void {
    this.callHistory.push({ method, args });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Mock network client
 */
export class MockNetworkClient {
  private responses = new Map<string, any>();
  private latency = 0;

  setResponse(endpoint: string, response: any): void {
    this.responses.set(endpoint, response);
  }

  setLatency(ms: number): void {
    this.latency = ms;
  }

  async fetch(endpoint: string): Promise<any> {
    if (this.latency > 0) {
      await new Promise(resolve => setTimeout(resolve, this.latency));
    }

    const response = this.responses.get(endpoint);
    if (!response) {
      throw new Error(`No mock response for ${endpoint}`);
    }

    return response;
  }

  reset(): void {
    this.responses.clear();
    this.latency = 0;
  }
}

/**
 * Spy utilities for tracking function calls
 */
export class FunctionSpy<T extends (...args: any[]) => any> {
  private calls: Array<{ args: Parameters<T>; result?: ReturnType<T>; error?: Error }> = [];
  private implementation?: T;

  constructor(private original: T) {
    this.implementation = original;
  }

  setImplementation(fn: T): void {
    this.implementation = fn;
  }

  async call(...args: Parameters<T>): Promise<ReturnType<T>> {
    try {
      const result = await this.implementation!(...args);
      this.calls.push({ args, result });
      return result;
    } catch (error) {
      this.calls.push({ args, error: error as Error });
      throw error;
    }
  }

  getCallCount(): number {
    return this.calls.length;
  }

  getCallArgs(index: number): Parameters<T> {
    return this.calls[index]?.args;
  }

  getAllCalls(): Array<{ args: Parameters<T>; result?: ReturnType<T>; error?: Error }> {
    return [...this.calls];
  }

  wasCalledWith(...args: Parameters<T>): boolean {
    return this.calls.some(call => JSON.stringify(call.args) === JSON.stringify(args));
  }

  reset(): void {
    this.calls = [];
    this.implementation = this.original;
  }
}

export function createMockClient(): MockSprintFundClient {
  return new MockSprintFundClient();
}

export function createMockNetwork(): MockNetworkClient {
  return new MockNetworkClient();
}

export function createSpy<T extends (...args: any[]) => any>(fn: T): FunctionSpy<T> {
  return new FunctionSpy(fn);
}

// Global instances
const globalMockClient = new MockSprintFundClient();
const globalMockNetwork = new MockNetworkClient();

export {
  globalMockClient,
  globalMockNetwork,
};
