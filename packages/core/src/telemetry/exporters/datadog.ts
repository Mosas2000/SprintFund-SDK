/**
 * Datadog Metrics Exporter
 * 
 * Exports metrics and events to Datadog.
 */

import { Metrics } from '../metrics';
import { tracer, Span } from '../tracer';

export interface DatadogConfig {
  /**
   * Datadog API key
   */
  apiKey: string;

  /**
   * Datadog site (datadoghq.com or datadoghq.eu)
   */
  site?: string;

  /**
   * Enable/disable exporter
   */
  enabled?: boolean;

  /**
   * Batch size for metric flushes
   */
  batchSize?: number;

  /**
   * Flush interval in milliseconds
   */
  flushInterval?: number;

  /**
   * Tags to add to all metrics
   */
  globalTags?: Record<string, string>;
}

export interface DatadogMetric {
  metric: string;
  points: Array<[number, number]>;
  type?: 'gauge' | 'count' | 'rate' | 'histogram';
  tags?: string[];
  host?: string;
}

export class DatadogExporter {
  private config: Required<DatadogConfig>;
  private metrics: Metrics;
  private queue: DatadogMetric[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(metrics: Metrics, config: DatadogConfig) {
    this.metrics = metrics;
    this.config = {
      apiKey: config.apiKey,
      site: config.site || 'datadoghq.com',
      enabled: config.enabled !== false,
      batchSize: config.batchSize || 100,
      flushInterval: config.flushInterval || 10000,
      globalTags: config.globalTags || {}
    };

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Send metrics to Datadog
   */
  async flush(): Promise<void> {
    if (!this.config.enabled) return;
    if (this.queue.length === 0) return;

    try {
      const metricsToSend = this.queue.splice(0, this.config.batchSize);
      await this.sendMetrics(metricsToSend);
    } catch (error) {
      console.error('Failed to flush metrics to Datadog:', error);
      // Re-queue failed metrics
      if (this.queue.length > 0) {
        this.queue.unshift(...this.queue);
      }
    }
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.config.enabled) return;

    const metric: DatadogMetric = {
      metric: `sf_protocol.${name}`,
      points: [[Math.floor(Date.now() / 1000), value]],
      type: 'gauge',
      tags: this.formatTags(tags)
    };

    this.queue.push(metric);

    if (this.queue.length >= this.config.batchSize) {
      this.flush().catch(console.error);
    }
  }

  /**
   * Record a span trace
   */
  recordSpan(span: Span): void {
    if (!this.config.enabled) return;

    const tags = {
      ...this.config.globalTags,
      trace_id: span.traceId,
      span_id: span.spanId,
      service: 'sf-protocol',
      span_name: span.name,
      status: span.status
    };

    this.recordMetric('span_duration_ms', span.duration || 0, tags);
  }

  /**
   * Send an event to Datadog
   */
  async sendEvent(event: {
    title: string;
    text: string;
    alertType?: 'error' | 'warning' | 'success' | 'info';
    tags?: string[];
  }): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const url = `https://api.${this.config.site}/api/v1/events`;

      const payload = {
        title: event.title,
        text: event.text,
        alert_type: event.alertType || 'info',
        tags: [...(event.tags || []), ...Object.entries(this.config.globalTags).map(([k, v]) => `${k}:${v}`)],
        timestamp: Math.floor(Date.now() / 1000)
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'DD-API-KEY': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Datadog API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send event to Datadog:', error);
    }
  }

  /**
   * Stop exporter
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.config.enabled = false;
  }

  private async sendMetrics(metricsToSend: DatadogMetric[]): Promise<void> {
    const url = `https://api.${this.config.site}/api/v1/series`;

    const payload = {
      series: metricsToSend
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'DD-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Datadog API error: ${response.status}`);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.config.flushInterval);
  }

  private formatTags(tags?: Record<string, string>): string[] {
    const combined = { ...this.config.globalTags, ...tags };
    return Object.entries(combined).map(([k, v]) => `${k}:${v}`);
  }
}

/**
 * Create a Datadog exporter
 */
export function createDatadogExporter(
  metrics: Metrics,
  config: DatadogConfig
): DatadogExporter {
  return new DatadogExporter(metrics, config);
}
