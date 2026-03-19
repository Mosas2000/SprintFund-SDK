import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreaker, createCircuitBreaker } from '../../../src/resilience/circuit-breaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = createCircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 100
    });
  });

  describe('States', () => {
    it('should start in closed state', () => {
      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should transition to open after failure threshold', async () => {
      let callCount = 0;
      const failingFn = async () => {
        callCount++;
        throw new Error('Service error');
      };

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingFn);
        } catch (e) {
          // Expected
        }
      }

      expect(circuitBreaker.getState()).toBe('open');
    });

    it('should reject requests when open', async () => {
      circuitBreaker.open();

      const fn = async () => 'success';

      await expect(circuitBreaker.execute(fn)).rejects.toThrow('Circuit breaker is OPEN');
    });

    it('should transition to half-open after timeout', async () => {
      circuitBreaker.open();
      
      // Immediately should be open
      expect(circuitBreaker.getState()).toBe('open');

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should attempt check (half-open)
      const fn = async () => 'success';
      await circuitBreaker.execute(fn);
      
      // Should be closed after success
      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should close after success threshold in half-open', async () => {
      circuitBreaker.open();
      const fn = async () => 'success';

      // After timeout, should be half-open
      await new Promise(resolve => setTimeout(resolve, 150));

      // First success
      await circuitBreaker.execute(fn);
      expect(circuitBreaker.getState()).toBe('half-open');

      // Second success should close
      await new Promise(resolve => setTimeout(resolve, 10));
      await circuitBreaker.execute(fn);
      expect(circuitBreaker.getState()).toBe('closed');
    });
  });

  describe('Execution', () => {
    it('should execute successful function when closed', async () => {
      const fn = async () => 'success';
      const result = await circuitBreaker.execute(fn);

      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe('closed');
    });

    it('should propagate errors from function', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };

      await expect(circuitBreaker.execute(fn)).rejects.toThrow('Test error');
    });

    it('should track metrics', async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        if (callCount < 2) throw new Error('Fail');
        return 'success';
      };

      try {
        await circuitBreaker.execute(fn);
      } catch (e) {
        // Expected
      }

      await circuitBreaker.execute(fn);

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.failures).toBeGreaterThan(0);
      expect(metrics.successes).toBeGreaterThan(0);
    });
  });

  describe('Manual Control', () => {
    it('should reset circuit breaker', async () => {
      circuitBreaker.open();
      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe('closed');
      expect(circuitBreaker.getMetrics().failures).toBe(0);
    });

    it('should manually open circuit', async () => {
      circuitBreaker.open();
      expect(circuitBreaker.getState()).toBe('open');
    });

    it('should manually close circuit', async () => {
      circuitBreaker.open();
      circuitBreaker.close();

      expect(circuitBreaker.getState()).toBe('closed');
    });
  });

  describe('Sync Execution', () => {
    it('should execute sync function', () => {
      const fn = () => 'success';
      const result = circuitBreaker.executeSync(fn);

      expect(result).toBe('success');
    });

    it('should reject sync requests when open', () => {
      circuitBreaker.open();
      const fn = () => 'success';

      expect(() => circuitBreaker.executeSync(fn)).toThrow('Circuit breaker is OPEN');
    });
  });

  describe('Custom Error Handler', () => {
    it('should use custom isFailure function', async () => {
      const cb = createCircuitBreaker({
        failureThreshold: 3,
        isFailure: (error) => error.message.includes('permanent')
      });

      const temporaryError = async () => {
        throw new Error('temporary error');
      };

      // Should not count as failure
      for (let i = 0; i < 5; i++) {
        try {
          await cb.execute(temporaryError);
        } catch (e) {
          // Expected
        }
      }

      expect(cb.getState()).toBe('closed');
    });
  });
});
