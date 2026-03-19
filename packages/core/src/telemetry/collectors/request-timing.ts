/**
 * Request Timing Collector
 * 
 * Collects timing metrics for requests and operations.
 */

import { Metrics, metrics as globalMetrics } from './metrics';

export interface RequestTiming {
  name: string;
  method?: string;
  path?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

export class RequestTimingCollector {
  private timings: RequestTiming[] = [];
  private maxTimings: number;
  private metrics: Metrics;

  constructor(maxTimings: number = 1000, metrics?: Metrics) {
    this.maxTimings = maxTimings;
    this.metrics = metrics || globalMetrics;
  }

  /**
   * Start timing a request
   */
  startTiming(
    name: string,
    metadata?: Record<string, any>
  ): RequestTiming {
    const timing: RequestTiming = {
      name,
      startTime: Date.now(),
      metadata
    };

    this.timings.push(timing);

    // Keep only recent timings
    if (this.timings.length > this.maxTimings) {
      this.timings = this.timings.slice(-this.maxTimings);
    }

    return timing;
  }

  /**
   * End timing a request
   */
  endTiming(
    timing: RequestTiming,
    status?: number,
    error?: Error
  ): RequestTiming {
    timing.endTime = Date.now();
    timing.duration = timing.endTime - timing.startTime;
    timing.status = status;
    timing.error = error;

    // Record metrics
    this.metrics.recordHistogram(
      'request_duration_ms',
      timing.duration,
      {
        name: timing.name,
        status: status?.toString() || 'unknown'
      }
    );

    if (error) {
      this.metrics.incrementCounter('request_errors_total', 1, {
        name: timing.name
      });
    }

    return timing;
  }

  /**
   * Measure function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const timing = this.startTiming(name, metadata);

    try {
      const result = await fn();
      this.endTiming(timing);
      return result;
    } catch (error) {
      this.endTiming(timing, 500, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const timing = this.startTiming(name, metadata);

    try {
      const result = fn();
      this.endTiming(timing);
      return result;
    } catch (error) {
      this.endTiming(timing, 500, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get average request time
   */
  getAverageTime(name?: string): number {
    let timings = this.timings;

    if (name) {
      timings = timings.filter(t => t.name === name);
    }

    if (timings.length === 0) return 0;

    const completed = timings.filter(t => t.duration !== undefined);
    if (completed.length === 0) return 0;

    const sum = completed.reduce((acc, t) => acc + (t.duration || 0), 0);
    return sum / completed.length;
  }

  /**
   * Get p95 request time
   */
  getP95Time(name?: string): number {
    let timings = this.timings;

    if (name) {
      timings = timings.filter(t => t.name === name);
    }

    const completed = timings
      .filter(t => t.duration !== undefined)
      .map(t => t.duration as number)
      .sort((a, b) => a - b);

    if (completed.length === 0) return 0;

    const index = Math.ceil(completed.length * 0.95) - 1;
    return completed[Math.max(0, index)];
  }

  /**
   * Get error rate
   */
  getErrorRate(name?: string): number {
    let timings = this.timings;

    if (name) {
      timings = timings.filter(t => t.name === name);
    }

    if (timings.length === 0) return 0;

    const errors = timings.filter(t => t.error).length;
    return errors / timings.length;
  }

  /**
   * Get recent timings
   */
  getRecent(count: number = 10, name?: string): RequestTiming[] {
    let timings = this.timings;

    if (name) {
      timings = timings.filter(t => t.name === name);
    }

    return timings.slice(-count).reverse();
  }

  /**
   * Get timing statistics
   */
  getStats(name?: string): {
    count: number;
    errors: number;
    errorRate: number;
    avgTime: number;
    p95Time: number;
    minTime: number;
    maxTime: number;
  } {
    let timings = this.timings;

    if (name) {
      timings = timings.filter(t => t.name === name);
    }

    const completed = timings.filter(t => t.duration !== undefined);
    const durations = completed.map(t => t.duration as number);

    return {
      count: timings.length,
      errors: timings.filter(t => t.error).length,
      errorRate: this.getErrorRate(name),
      avgTime: this.getAverageTime(name),
      p95Time: this.getP95Time(name),
      minTime: durations.length > 0 ? Math.min(...durations) : 0,
      maxTime: durations.length > 0 ? Math.max(...durations) : 0
    };
  }

  /**
   * Clear all timings
   */
  clear(): void {
    this.timings = [];
  }
}

export const requestTimingCollector = new RequestTimingCollector();

/**
 * Create a request timing collector
 */
export function createRequestTimingCollector(
  maxTimings?: number,
  metrics?: Metrics
): RequestTimingCollector {
  return new RequestTimingCollector(maxTimings, metrics);
}
