/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures by failing fast when a service is down.
 */

export interface CircuitBreakerConfig {
  /**
   * Number of failures before opening circuit
   */
  failureThreshold: number;

  /**
   * Number of successes to close circuit
   */
  successThreshold?: number;

  /**
   * Time to wait before attempting half-open
   */
  timeout?: number;

  /**
   * Function to determine if an error should count as failure
   */
  isFailure?: (error: Error) => boolean;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerMetrics {
  failures: number;
  successes: number;
  rejections: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private rejectionCount = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private nextAttemptTime?: number;
  private config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000, // 1 minute
      isFailure: config.isFailure || (() => true)
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.checkState();

    if (this.state === 'open') {
      this.rejectionCount++;
      throw new Error(`Circuit breaker is OPEN. Rejecting request.`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      if (this.config.isFailure(error instanceof Error ? error : new Error(String(error)))) {
        this.onFailure();
      }
      throw error;
    }
  }

  /**
   * Execute synchronous function with circuit breaker protection
   */
  executeSync<T>(fn: () => T): T {
    this.checkState();

    if (this.state === 'open') {
      this.rejectionCount++;
      throw new Error(`Circuit breaker is OPEN. Rejecting request.`);
    }

    try {
      const result = fn();
      this.onSuccess();
      return result;
    } catch (error) {
      if (this.config.isFailure(error instanceof Error ? error : new Error(String(error)))) {
        this.onFailure();
      }
      throw error;
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    this.checkState();
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      failures: this.failureCount,
      successes: this.successCount,
      rejections: this.rejectionCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.rejectionCount = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttemptTime = undefined;
  }

  /**
   * Manually open circuit
   */
  open(): void {
    this.state = 'open';
    this.nextAttemptTime = Date.now() + this.config.timeout;
  }

  /**
   * Manually close circuit
   */
  close(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
  }

  private checkState(): void {
    if (this.state === 'half-open') {
      // Already attempting recovery
      return;
    }

    if (this.state === 'open' && this.nextAttemptTime && Date.now() >= this.nextAttemptTime) {
      // Try to recover
      this.state = 'half-open';
      this.successCount = 0;
    }
  }

  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.state = 'closed';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;

    if (this.failureCount >= this.config.failureThreshold) {
      this.open();
    }

    if (this.state === 'half-open') {
      // Immediately reopen on failure
      this.open();
      this.successCount = 0;
    }
  }
}

/**
 * Create a circuit breaker
 */
export function createCircuitBreaker(config: CircuitBreakerConfig): CircuitBreaker {
  return new CircuitBreaker(config);
}
