/**
 * Retry Policy with Exponential Backoff
 * 
 * Implements intelligent retry logic with configurable backoff strategies.
 */

export type BackoffStrategy = 'linear' | 'exponential' | 'fibonacci';

export interface RetryPolicyConfig {
  /**
   * Maximum number of retry attempts
   */
  maxRetries: number;

  /**
   * Initial delay in milliseconds
   */
  initialDelay?: number;

  /**
   * Maximum delay between retries
   */
  maxDelay?: number;

  /**
   * Backoff strategy
   */
  backoffStrategy?: BackoffStrategy;

  /**
   * Function to determine if error is retryable
   */
  isRetryable?: (error: Error, attempt: number) => boolean;

  /**
   * Jitter factor (0.0 to 1.0) to randomize delays
   */
  jitter?: number;

  /**
   * Timeout for individual retry attempt
   */
  timeout?: number;
}

export interface RetryAttempt {
  attempt: number;
  error: Error;
  nextRetryIn?: number;
}

export class RetryPolicy {
  private config: Required<RetryPolicyConfig>;

  constructor(config: RetryPolicyConfig) {
    this.config = {
      maxRetries: config.maxRetries,
      initialDelay: config.initialDelay || 100,
      maxDelay: config.maxDelay || 30000,
      backoffStrategy: config.backoffStrategy || 'exponential',
      isRetryable: config.isRetryable || this.defaultIsRetryable,
      jitter: config.jitter || 0.1,
      timeout: config.timeout || 30000
    };
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error = new Error('Unknown error');
    const attempts: RetryAttempt[] = [];

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.executeWithTimeout(fn, this.config.timeout);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.maxRetries && this.config.isRetryable(lastError, attempt)) {
          const delay = this.calculateDelay(attempt);
          const nextRetryIn = delay;

          attempts.push({
            attempt,
            error: lastError,
            nextRetryIn
          });

          await this.delay(delay);
        } else {
          attempts.push({
            attempt,
            error: lastError
          });
          break;
        }
      }
    }

    const error = new Error(`Failed after ${attempts.length} attempts: ${lastError.message}`);
    (error as any).attempts = attempts;
    throw error;
  }

  /**
   * Execute synchronous function with retry logic
   */
  executeSync<T>(fn: () => T): T {
    let lastError: Error = new Error('Unknown error');
    const attempts: RetryAttempt[] = [];

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.maxRetries && this.config.isRetryable(lastError, attempt)) {
          // Sync version can't delay, so just track attempts
          attempts.push({
            attempt,
            error: lastError
          });
        } else {
          attempts.push({
            attempt,
            error: lastError
          });
          break;
        }
      }
    }

    const error = new Error(`Failed after ${attempts.length} attempts: ${lastError.message}`);
    (error as any).attempts = attempts;
    throw error;
  }

  /**
   * Get retry statistics
   */
  getStats() {
    return {
      maxRetries: this.config.maxRetries,
      initialDelay: this.config.initialDelay,
      maxDelay: this.config.maxDelay,
      backoffStrategy: this.config.backoffStrategy
    };
  }

  private calculateDelay(attempt: number): number {
    let delay: number;

    switch (this.config.backoffStrategy) {
      case 'linear':
        delay = this.config.initialDelay * (attempt + 1);
        break;

      case 'exponential':
        delay = this.config.initialDelay * Math.pow(2, attempt);
        break;

      case 'fibonacci': {
        const fib = this.fibonacci(attempt + 1);
        delay = this.config.initialDelay * fib;
        break;
      }

      default:
        delay = this.config.initialDelay;
    }

    // Add jitter
    const jitterAmount = delay * this.config.jitter;
    delay += Math.random() * jitterAmount - jitterAmount / 2;

    // Cap at max delay
    return Math.min(delay, this.config.maxDelay);
  }

  private fibonacci(n: number): number {
    if (n <= 1) return 1;
    if (n === 2) return 1;

    let a = 1,
      b = 1;
    for (let i = 3; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      )
    ]);
  }

  private defaultIsRetryable(error: Error): boolean {
    // Retry on network-like errors
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('socket hang up') ||
      message.includes('temporarily unavailable')
    );
  }
}

/**
 * Pre-configured retry policies
 */
export const RetryPolicies = {
  /**
   * Aggressive: 5 retries with exponential backoff
   */
  aggressive: (): RetryPolicy =>
    new RetryPolicy({
      maxRetries: 5,
      initialDelay: 50,
      maxDelay: 10000,
      backoffStrategy: 'exponential'
    }),

  /**
   * Standard: 3 retries with exponential backoff
   */
  standard: (): RetryPolicy =>
    new RetryPolicy({
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 10000,
      backoffStrategy: 'exponential'
    }),

  /**
   * Conservative: 2 retries with linear backoff
   */
  conservative: (): RetryPolicy =>
    new RetryPolicy({
      maxRetries: 2,
      initialDelay: 500,
      maxDelay: 5000,
      backoffStrategy: 'linear'
    }),

  /**
   * None: No retries
   */
  none: (): RetryPolicy =>
    new RetryPolicy({
      maxRetries: 0
    })
};

/**
 * Create a retry policy with custom configuration
 */
export function createRetryPolicy(config: RetryPolicyConfig): RetryPolicy {
  return new RetryPolicy(config);
}
