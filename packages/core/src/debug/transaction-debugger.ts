/**
 * Transaction Debugger
 * 
 * Analyzes and logs contract transaction details for debugging.
 */

import { Logger } from './logger';

export interface TransactionDebugInfo {
  id: string;
  functionName: string;
  contractAddress: string;
  arguments: any[];
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'success' | 'failed';
  result?: any;
  error?: Error;
  gasEstimate?: number;
  gasUsed?: number;
  fee?: number;
}

export class TransactionDebugger {
  private transactions: Map<string, TransactionDebugInfo> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Start tracking a transaction
   */
  startTransaction(
    id: string,
    functionName: string,
    contractAddress: string,
    args: any[]
  ): TransactionDebugInfo {
    const info: TransactionDebugInfo = {
      id,
      functionName,
      contractAddress,
      arguments: args,
      startTime: Date.now(),
      status: 'pending'
    };

    this.transactions.set(id, info);

    this.logger.debug('Transaction started', {
      txId: id,
      function: functionName,
      contract: contractAddress,
      argCount: args.length
    });

    return info;
  }

  /**
   * Mark transaction as successful
   */
  successTransaction(id: string, result?: any, gasUsed?: number): TransactionDebugInfo {
    const info = this.transactions.get(id);
    if (!info) {
      throw new Error(`Transaction not found: ${id}`);
    }

    info.endTime = Date.now();
    info.duration = info.endTime - info.startTime;
    info.status = 'success';
    info.result = result;
    info.gasUsed = gasUsed;

    this.logger.info('Transaction succeeded', {
      txId: id,
      duration: info.duration,
      gas: gasUsed
    });

    return info;
  }

  /**
   * Mark transaction as failed
   */
  failTransaction(id: string, error: Error): TransactionDebugInfo {
    const info = this.transactions.get(id);
    if (!info) {
      throw new Error(`Transaction not found: ${id}`);
    }

    info.endTime = Date.now();
    info.duration = info.endTime - info.startTime;
    info.status = 'failed';
    info.error = error;

    this.logger.error('Transaction failed', error, {
      txId: id,
      duration: info.duration
    });

    return info;
  }

  /**
   * Get transaction info
   */
  getTransaction(id: string): TransactionDebugInfo | undefined {
    return this.transactions.get(id);
  }

  /**
   * Get all transactions
   */
  getAllTransactions(): TransactionDebugInfo[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Get transactions by status
   */
  getTransactionsByStatus(status: string): TransactionDebugInfo[] {
    return Array.from(this.transactions.values()).filter(t => t.status === status);
  }

  /**
   * Get transaction summary
   */
  getSummary(): {
    total: number;
    pending: number;
    succeeded: number;
    failed: number;
    totalDuration: number;
    averageDuration: number;
    totalGasUsed: number;
  } {
    const transactions = Array.from(this.transactions.values());
    const completed = transactions.filter(t => t.duration !== undefined);

    return {
      total: transactions.length,
      pending: transactions.filter(t => t.status === 'pending').length,
      succeeded: transactions.filter(t => t.status === 'success').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      totalDuration: completed.reduce((sum, t) => sum + (t.duration || 0), 0),
      averageDuration: completed.length > 0
        ? completed.reduce((sum, t) => sum + (t.duration || 0), 0) / completed.length
        : 0,
      totalGasUsed: transactions.reduce((sum, t) => sum + (t.gasUsed || 0), 0)
    };
  }

  /**
   * Clear all transactions
   */
  clear(): void {
    this.transactions.clear();
  }

  /**
   * Format transaction for logging
   */
  formatTransaction(tx: TransactionDebugInfo): string {
    const status = tx.status.toUpperCase();
    const duration = tx.duration ? `${tx.duration}ms` : 'pending';
    const gas = tx.gasUsed ? `${tx.gasUsed} gas` : '';

    return `[${status}] ${tx.functionName} on ${tx.contractAddress} - ${duration} ${gas}`.trim();
  }
}

/**
 * Create a transaction debugger
 */
export function createTransactionDebugger(logger: Logger): TransactionDebugger {
  return new TransactionDebugger(logger);
}
