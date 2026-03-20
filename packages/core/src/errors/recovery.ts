/**
 * Error recovery and resilience strategies for fault tolerance
 */

export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  CIRCUIT_BREAK = 'circuit_break',
  QUEUE = 'queue',
  DEGRADE = 'degrade',
}

export interface RecoveryContext {
  attempt: number;
  maxAttempts: number;
  lastError?: Error;
  startTime: number;
  elapsedMs: number;
}

export interface RecoveryConfig {
  strategy: RecoveryStrategy;
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  timeoutMs?: number;
  fallbackValue?: any;
}

/**
 * Adaptive retry handler with exponential backoff and jitter
 */
export class RetryHandler {
  private readonly config: Required<RecoveryConfig>;

  constructor(config: RecoveryConfig) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 3,
      initialDelayMs: config.initialDelayMs ?? 100,
      maxDelayMs: config.maxDelayMs ?? 5000,
      backoffMultiplier: config.backoffMultiplier ?? 2,
      timeoutMs: config.timeoutMs ?? 30000,
      fallbackValue: config.fallbackValue,
      strategy: RecoveryStrategy.RETRY,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), this.config.timeoutMs)
        );
        return await Promise.race([fn(), timeoutPromise]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.maxAttempts) {
          const delayMs = this.calculateBackoffDelay(attempt);
          await this.sleep(delayMs);
        }
      }
    }

    throw lastError ?? new Error('Operation failed after retries');
  }

  private calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelayMs);
    const jitter = cappedDelay * (Math.random() - 0.5);
    return Math.max(0, cappedDelay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit breaker pattern for cascading failure prevention
 */
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;

  constructor(
    private failureThreshold = 5,
    private successThreshold = 2,
    private resetTimeoutMs = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'half-open') {
        this.successCount++;
        if (this.successCount >= this.successThreshold) {
          this.state = 'closed';
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else if (this.state === 'closed') {
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open';
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
  }
}

/**
 * Graceful degradation manager for feature fallbacks
 */
export class DegradationManager {
  private degradedFeatures = new Map<string, any>();

  degrade(feature: string, fallbackValue: any): void {
    this.degradedFeatures.set(feature, fallbackValue);
  }

  restore(feature: string): void {
    this.degradedFeatures.delete(feature);
  }

  isDegraded(feature: string): boolean {
    return this.degradedFeatures.has(feature);
  }

  getValue<T>(feature: string, normalValue: T): T {
    return this.degradedFeatures.has(feature) ? this.degradedFeatures.get(feature) : normalValue;
  }

  getStatus(): Record<string, any> {
    return Object.fromEntries(this.degradedFeatures);
  }
}

/**
 * Request queue for rate limiting and ordering
 */
export class RequestQueue {
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = [];
  private processing = false;
  private activeRequests = 0;

  constructor(private maxConcurrent = 5, private minDelayMs = 100) {}

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) continue;

      this.activeRequests++;
      try {
        await this.sleep(this.minDelayMs);
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        item.reject(error instanceof Error ? error : new Error(String(error)));
      } finally {
        this.activeRequests--;
      }
    }

    this.processing = false;
    if (this.queue.length > 0) this.process();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getActiveRequests(): number {
    return this.activeRequests;
  }
}

// Global recovery instances
const globalRetryHandler = new RetryHandler({ maxAttempts: 3 });
const globalCircuitBreaker = new CircuitBreaker(5, 2, 30000);
const globalDegradationManager = new DegradationManager();
const globalRequestQueue = new RequestQueue(5, 100);

export function createRetryHandler(config: RecoveryConfig): RetryHandler {
  return new RetryHandler(config);
}

export function createCircuitBreaker(
  failureThreshold?: number,
  successThreshold?: number,
  resetTimeoutMs?: number
): CircuitBreaker {
  return new CircuitBreaker(failureThreshold, successThreshold, resetTimeoutMs);
}

export function createDegradationManager(): DegradationManager {
  return new DegradationManager();
}

export function createRequestQueue(maxConcurrent?: number, minDelayMs?: number): RequestQueue {
  return new RequestQueue(maxConcurrent, minDelayMs);
}

export {
  globalRetryHandler,
  globalCircuitBreaker,
  globalDegradationManager,
  globalRequestQueue,
};
