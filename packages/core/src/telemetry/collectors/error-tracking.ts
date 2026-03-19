/**
 * Error Tracking Collector
 * 
 * Tracks and aggregates errors with context and stack traces.
 */

import { Metrics, metrics as globalMetrics } from '../metrics';

export interface ErrorRecord {
  id: string;
  error: Error;
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
  count: number;
  lastOccurred: number;
  fingerprint?: string;
}

export class ErrorTrackingCollector {
  private errors: Map<string, ErrorRecord> = new Map();
  private maxErrors: number;
  private metrics: Metrics;

  constructor(maxErrors: number = 1000, metrics?: Metrics) {
    this.maxErrors = maxErrors;
    this.metrics = metrics || globalMetrics;
  }

  /**
   * Record an error
   */
  recordError(
    error: Error,
    context?: Record<string, any>
  ): ErrorRecord {
    const fingerprint = this.generateFingerprint(error);
    const existing = this.errors.get(fingerprint);

    if (existing) {
      existing.count++;
      existing.lastOccurred = Date.now();
      return existing;
    }

    const record: ErrorRecord = {
      id: this.generateId(),
      error,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context,
      count: 1,
      lastOccurred: Date.now(),
      fingerprint
    };

    this.errors.set(fingerprint, record);

    // Cleanup old errors if limit exceeded
    if (this.errors.size > this.maxErrors) {
      const first = this.errors.keys().next().value;
      this.errors.delete(first);
    }

    // Record metrics
    this.metrics.incrementCounter('errors_total', 1, {
      type: error.constructor.name,
      message: error.message.slice(0, 50)
    });

    return record;
  }

  /**
   * Get error by fingerprint
   */
  getError(fingerprint: string): ErrorRecord | undefined {
    return this.errors.get(fingerprint);
  }

  /**
   * Get all errors
   */
  getAllErrors(): ErrorRecord[] {
    return Array.from(this.errors.values());
  }

  /**
   * Get errors sorted by frequency
   */
  getTopErrors(limit: number = 10): ErrorRecord[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: string): ErrorRecord[] {
    return Array.from(this.errors.values()).filter(
      e => e.error.constructor.name === type
    );
  }

  /**
   * Get error rate (errors per minute)
   */
  getErrorRate(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentErrors = Array.from(this.errors.values()).filter(
      e => e.lastOccurred > oneMinuteAgo
    );

    const totalCount = recentErrors.reduce((sum, e) => sum + e.count, 0);
    return totalCount / 60; // Per second
  }

  /**
   * Get error statistics
   */
  getStats(): {
    totalErrors: number;
    totalOccurrences: number;
    errorRate: number;
    topErrors: ErrorRecord[];
  } {
    const all = Array.from(this.errors.values());

    return {
      totalErrors: all.length,
      totalOccurrences: all.reduce((sum, e) => sum + e.count, 0),
      errorRate: this.getErrorRate(),
      topErrors: this.getTopErrors(5)
    };
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors.clear();
  }

  /**
   * Clear errors by type
   */
  clearByType(type: string): void {
    for (const [key, error] of this.errors.entries()) {
      if (error.error.constructor.name === type) {
        this.errors.delete(key);
      }
    }
  }

  private generateFingerprint(error: Error): string {
    const stack = error.stack || '';
    const lines = stack.split('\n').slice(0, 3).join('\n');
    return Buffer.from(lines).toString('base64').slice(0, 32);
  }

  private generateId(): string {
    return 'err_' + Math.random().toString(36).substring(2);
  }
}

export const errorTrackingCollector = new ErrorTrackingCollector();

/**
 * Create an error tracking collector
 */
export function createErrorTrackingCollector(
  maxErrors?: number,
  metrics?: Metrics
): ErrorTrackingCollector {
  return new ErrorTrackingCollector(maxErrors, metrics);
}
