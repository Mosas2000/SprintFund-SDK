/**
 * Metrics Collection System
 * 
 * OpenTelemetry-compatible metrics for monitoring SDK performance and usage.
 */

export interface MetricValue {
  value: number;
  timestamp: number;
  attributes?: Record<string, string | number>;
}

export interface MetricData {
  name: string;
  description: string;
  unit: string;
  values: MetricValue[];
}

export interface MetricConfig {
  samplingRate?: number; // 0.0 to 1.0
  aggregationInterval?: number; // milliseconds
}

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export class Metrics {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private metrics: Map<string, MetricData> = new Map();
  private config: Required<MetricConfig>;
  private samplingRate: number;

  constructor(config: MetricConfig = {}) {
    this.config = {
      samplingRate: config.samplingRate || 1.0,
      aggregationInterval: config.aggregationInterval || 60000
    };
    this.samplingRate = this.config.samplingRate;
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1, attributes?: Record<string, string | number>): void {
    if (!this.shouldSample()) return;

    const key = this.buildKey(name, attributes);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);

    this.recordMetric('counter', name, value, attributes);
  }

  /**
   * Set a gauge metric
   */
  setGauge(name: string, value: number, attributes?: Record<string, string | number>): void {
    if (!this.shouldSample()) return;

    const key = this.buildKey(name, attributes);
    this.gauges.set(key, value);

    this.recordMetric('gauge', name, value, attributes);
  }

  /**
   * Record a histogram value
   */
  recordHistogram(name: string, value: number, attributes?: Record<string, string | number>): void {
    if (!this.shouldSample()) return;

    const key = this.buildKey(name, attributes);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);

    this.recordMetric('histogram', name, value, attributes);
  }

  /**
   * Get counter value
   */
  getCounter(name: string, attributes?: Record<string, string | number>): number {
    const key = this.buildKey(name, attributes);
    return this.counters.get(key) || 0;
  }

  /**
   * Get gauge value
   */
  getGauge(name: string, attributes?: Record<string, string | number>): number {
    const key = this.buildKey(name, attributes);
    return this.gauges.get(key) || 0;
  }

  /**
   * Get histogram statistics
   */
  getHistogramStats(name: string, attributes?: Record<string, string | number>): {
    count: number;
    min: number;
    max: number;
    mean: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const key = this.buildKey(name, attributes);
    const values = this.histograms.get(key);

    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const mean = sorted.reduce((a, b) => a + b, 0) / count;

    return {
      count,
      min,
      max,
      mean,
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99)
    };
  }

  /**
   * Export all metrics
   */
  export(): MetricData[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.metrics.clear();
  }

  /**
   * Reset specific metric
   */
  resetMetric(name: string): void {
    for (const key of this.counters.keys()) {
      if (key.startsWith(name)) this.counters.delete(key);
    }
    for (const key of this.gauges.keys()) {
      if (key.startsWith(name)) this.gauges.delete(key);
    }
    for (const key of this.histograms.keys()) {
      if (key.startsWith(name)) this.histograms.delete(key);
    }
  }

  private recordMetric(
    type: MetricType,
    name: string,
    value: number,
    attributes?: Record<string, string | number>
  ): void {
    const data = this.metrics.get(name) || {
      name,
      description: '',
      unit: '',
      values: []
    };

    data.values.push({
      value,
      timestamp: Date.now(),
      attributes
    });

    // Keep only last 1000 values per metric
    if (data.values.length > 1000) {
      data.values = data.values.slice(-1000);
    }

    this.metrics.set(name, data);
  }

  private buildKey(name: string, attributes?: Record<string, string | number>): string {
    if (!attributes || Object.keys(attributes).length === 0) {
      return name;
    }

    const parts = Object.entries(attributes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');

    return `${name}:${parts}`;
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  private shouldSample(): boolean {
    return Math.random() < this.samplingRate;
  }
}

export const metrics = new Metrics();

/**
 * Common metric names
 */
export const MetricNames = {
  // Request metrics
  REQUEST_COUNT: 'requests_total',
  REQUEST_DURATION_MS: 'request_duration_ms',
  REQUEST_SIZE_BYTES: 'request_size_bytes',
  RESPONSE_SIZE_BYTES: 'response_size_bytes',

  // Error metrics
  ERROR_COUNT: 'errors_total',
  ERROR_RATE: 'error_rate',

  // Contract interaction metrics
  CONTRACT_CALLS: 'contract_calls_total',
  CONTRACT_CALL_DURATION_MS: 'contract_call_duration_ms',
  CACHE_HITS: 'cache_hits_total',
  CACHE_MISSES: 'cache_misses_total',

  // Rate limit metrics
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded_total',

  // Blockchain metrics
  BLOCK_HEIGHT: 'block_height',
  TRANSACTION_COUNT: 'transactions_total'
};

/**
 * Create a scoped metrics instance for a component
 */
export function createMetricsScope(component: string) {
  return {
    incrementCounter: (name: string, value?: number, attributes?: Record<string, string | number>) =>
      metrics.incrementCounter(
        `${component}_${name}`,
        value,
        attributes
      ),
    setGauge: (name: string, value: number, attributes?: Record<string, string | number>) =>
      metrics.setGauge(
        `${component}_${name}`,
        value,
        attributes
      ),
    recordHistogram: (name: string, value: number, attributes?: Record<string, string | number>) =>
      metrics.recordHistogram(
        `${component}_${name}`,
        value,
        attributes
      ),
    getHistogramStats: (name: string, attributes?: Record<string, string | number>) =>
      metrics.getHistogramStats(`${component}_${name}`, attributes)
  };
}
