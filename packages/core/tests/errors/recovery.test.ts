import { describe, it, expect, beforeEach } from 'vitest';
import {
  RetryHandler,
  CircuitBreaker,
  DegradationManager,
  RequestQueue,
  RecoveryStrategy,
} from '../../src/errors/recovery';

describe('RetryHandler', () => {
  it('should retry on failure with exponential backoff', async () => {
    let attempts = 0;
    const handler = new RetryHandler({ maxAttempts: 3, initialDelayMs: 10 });

    const result = await handler.execute(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Temporary failure');
      return 'success';
    });

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should respect maximum attempts', async () => {
    const handler = new RetryHandler({ maxAttempts: 2, initialDelayMs: 10 });

    await expect(
      handler.execute(async () => {
        throw new Error('Persistent failure');
      })
    ).rejects.toThrow('Persistent failure');
  });

  it('should apply timeout to operation', async () => {
    const handler = new RetryHandler({ maxAttempts: 1, timeoutMs: 50 });

    await expect(
      handler.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      })
    ).rejects.toThrow('Operation timeout');
  });
});

describe('CircuitBreaker', () => {
  it('should open circuit after failure threshold', async () => {
    const breaker = new CircuitBreaker(2, 1, 100);

    for (let i = 0; i < 2; i++) {
      await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    }

    expect(breaker.getState()).toBe('open');

    await expect(breaker.execute(() => Promise.resolve('success'))).rejects.toThrow(
      'Circuit breaker is open'
    );
  });

  it('should transition to half-open after reset timeout', async () => {
    const breaker = new CircuitBreaker(1, 1, 50);

    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    expect(breaker.getState()).toBe('open');

    await new Promise(resolve => setTimeout(resolve, 60));

    const result = await breaker.execute(() => Promise.resolve('success'));
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('closed');
  });

  it('should manually reset circuit', async () => {
    const breaker = new CircuitBreaker(1, 1, 1000);

    await expect(breaker.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    expect(breaker.getState()).toBe('open');

    breaker.reset();
    expect(breaker.getState()).toBe('closed');
  });
});

describe('DegradationManager', () => {
  let manager: DegradationManager;

  beforeEach(() => {
    manager = new DegradationManager();
  });

  it('should degrade feature with fallback value', () => {
    manager.degrade('payments', { enabled: false });
    expect(manager.isDegraded('payments')).toBe(true);
  });

  it('should restore feature', () => {
    manager.degrade('payments', { enabled: false });
    manager.restore('payments');
    expect(manager.isDegraded('payments')).toBe(false);
  });

  it('should return appropriate value based on degradation', () => {
    manager.degrade('api', null);
    expect(manager.getValue('api', { status: 'ok' })).toBeNull();
    expect(manager.getValue('other', { status: 'ok' })).toEqual({ status: 'ok' });
  });

  it('should report degradation status', () => {
    manager.degrade('feature1', 'fallback1');
    manager.degrade('feature2', 'fallback2');

    const status = manager.getStatus();
    expect(status).toEqual({
      feature1: 'fallback1',
      feature2: 'fallback2',
    });
  });
});

describe('RequestQueue', () => {
  it('should limit concurrent requests', async () => {
    let maxConcurrent = 0;
    let current = 0;
    const queue = new RequestQueue(2, 0);

    const increment = async () => {
      current++;
      maxConcurrent = Math.max(maxConcurrent, current);
      await new Promise(resolve => setTimeout(resolve, 10));
      current--;
    };

    await Promise.all([
      queue.enqueue(increment),
      queue.enqueue(increment),
      queue.enqueue(increment),
      queue.enqueue(increment),
    ]);

    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it('should enforce minimum delay between requests', async () => {
    const queue = new RequestQueue(1, 30);
    const times: number[] = [];

    await queue.enqueue(async () => times.push(Date.now()));
    await queue.enqueue(async () => times.push(Date.now()));
    await queue.enqueue(async () => times.push(Date.now()));

    const delay1 = times[1] - times[0];
    const delay2 = times[2] - times[1];

    expect(delay1).toBeGreaterThanOrEqual(30);
    expect(delay2).toBeGreaterThanOrEqual(30);
  });

  it('should track queue and active requests', async () => {
    const queue = new RequestQueue(1, 50);

    const promise1 = queue.enqueue(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    const promise2 = queue.enqueue(async () => {});

    expect(queue.getQueueSize()).toBeGreaterThan(0);

    await promise1;
    await promise2;

    expect(queue.getQueueSize()).toBe(0);
  });
});
