/**
 * Mock wallet adapter for testing
 */

export interface MockWalletState {
  connected: boolean;
  address: string | null;
  balance: bigint;
  pendingTxs: string[];
}

export interface MockTransaction {
  txId: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: string;
  timestamp: number;
}

export class MockWalletAdapter {
  private state: MockWalletState;
  private transactions: Map<string, MockTransaction> = new Map();
  private connectDelay: number = 0;
  private txDelay: number = 0;
  private shouldFailConnect: boolean = false;
  private shouldFailTx: boolean = false;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor(initialState?: Partial<MockWalletState>) {
    this.state = {
      connected: false,
      address: null,
      balance: 0n,
      pendingTxs: [],
      ...initialState,
    };
  }

  // Configuration
  setConnectDelay(ms: number): this {
    this.connectDelay = ms;
    return this;
  }

  setTxDelay(ms: number): this {
    this.txDelay = ms;
    return this;
  }

  setFailConnect(shouldFail: boolean): this {
    this.shouldFailConnect = shouldFail;
    return this;
  }

  setFailTx(shouldFail: boolean): this {
    this.shouldFailTx = shouldFail;
    return this;
  }

  setBalance(balance: bigint): this {
    this.state.balance = balance;
    this.emit('balanceChanged', balance);
    return this;
  }

  // Wallet interface
  async connect(): Promise<{ address: string }> {
    if (this.connectDelay > 0) {
      await new Promise((r) => setTimeout(r, this.connectDelay));
    }

    if (this.shouldFailConnect) {
      throw new Error('Wallet connection failed');
    }

    const address = `SP${Math.random().toString(36).slice(2, 10).toUpperCase()}MOCK`;
    this.state.connected = true;
    this.state.address = address;
    this.emit('connect', { address });
    return { address };
  }

  async disconnect(): Promise<void> {
    this.state.connected = false;
    this.state.address = null;
    this.emit('disconnect');
  }

  isConnected(): boolean {
    return this.state.connected;
  }

  getAddress(): string | null {
    return this.state.address;
  }

  getBalance(): bigint {
    return this.state.balance;
  }

  async signTransaction(tx: any): Promise<{ txId: string }> {
    if (!this.state.connected) {
      throw new Error('Wallet not connected');
    }

    if (this.txDelay > 0) {
      await new Promise((r) => setTimeout(r, this.txDelay));
    }

    if (this.shouldFailTx) {
      throw new Error('Transaction signing failed');
    }

    const txId = `0x${Math.random().toString(16).slice(2)}`;
    const mockTx: MockTransaction = {
      txId,
      status: 'pending',
      type: tx.functionName || 'unknown',
      timestamp: Date.now(),
    };

    this.transactions.set(txId, mockTx);
    this.state.pendingTxs.push(txId);
    this.emit('txSubmitted', mockTx);

    return { txId };
  }

  async signMessage(message: string): Promise<{ signature: string }> {
    if (!this.state.connected) {
      throw new Error('Wallet not connected');
    }

    if (this.shouldFailTx) {
      throw new Error('Message signing failed');
    }

    const signature = `sig_${Buffer.from(message).toString('base64').slice(0, 20)}`;
    return { signature };
  }

  // Transaction management
  confirmTransaction(txId: string): this {
    const tx = this.transactions.get(txId);
    if (tx) {
      tx.status = 'confirmed';
      this.state.pendingTxs = this.state.pendingTxs.filter((id) => id !== txId);
      this.emit('txConfirmed', tx);
    }
    return this;
  }

  failTransaction(txId: string): this {
    const tx = this.transactions.get(txId);
    if (tx) {
      tx.status = 'failed';
      this.state.pendingTxs = this.state.pendingTxs.filter((id) => id !== txId);
      this.emit('txFailed', tx);
    }
    return this;
  }

  getTransaction(txId: string): MockTransaction | undefined {
    return this.transactions.get(txId);
  }

  getPendingTransactions(): MockTransaction[] {
    return this.state.pendingTxs
      .map((id) => this.transactions.get(id))
      .filter((tx): tx is MockTransaction => tx !== undefined);
  }

  // Event handling
  on(event: string, callback: (...args: any[]) => void): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return this;
  }

  off(event: string, callback: (...args: any[]) => void): this {
    this.listeners.get(event)?.delete(callback);
    return this;
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach((cb) => cb(...args));
  }

  // Reset
  reset(): this {
    this.state = {
      connected: false,
      address: null,
      balance: 0n,
      pendingTxs: [],
    };
    this.transactions.clear();
    this.connectDelay = 0;
    this.txDelay = 0;
    this.shouldFailConnect = false;
    this.shouldFailTx = false;
    return this;
  }
}

export function createMockWallet(initialState?: Partial<MockWalletState>): MockWalletAdapter {
  return new MockWalletAdapter(initialState);
}
