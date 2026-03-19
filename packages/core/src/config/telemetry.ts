/**
 * Telemetry Configuration
 * 
 * Centralized configuration for all telemetry components.
 */

import { Metrics } from '../telemetry/metrics';
import { Tracer } from '../telemetry/tracer';
import { RequestTimingCollector } from '../telemetry/collectors/request-timing';
import { ErrorTrackingCollector } from '../telemetry/collectors/error-tracking';
import { PrometheusExporter } from '../telemetry/exporters/prometheus';
import { DatadogExporter, DatadogConfig } from '../telemetry/exporters/datadog';

export interface TelemetryConfig {
  /**
   * Enable telemetry collection
   */
  enabled?: boolean;

  /**
   * Metrics configuration
   */
  metrics?: {
    samplingRate?: number;
    aggregationInterval?: number;
  };

  /**
   * Tracing configuration
   */
  tracing?: {
    samplingRate?: number;
    maxSpans?: number;
  };

  /**
   * Datadog configuration (optional)
   */
  datadog?: DatadogConfig;

  /**
   * Custom exporters
   */
  exporters?: Array<(context: TelemetryContext) => void>;
}

export interface TelemetryContext {
  metrics: Metrics;
  tracer: Tracer;
  requestTiming: RequestTimingCollector;
  errorTracking: ErrorTrackingCollector;
  prometheusExporter: PrometheusExporter;
  datadogExporter?: DatadogExporter;
}

export class Telemetry {
  private config: Required<TelemetryConfig>;
  private context: TelemetryContext;

  constructor(config: TelemetryConfig = {}) {
    this.config = {
      enabled: config.enabled !== false,
      metrics: config.metrics || {},
      tracing: config.tracing || {},
      exporters: config.exporters || [],
      datadog: config.datadog
    };

    // Initialize components
    const metrics = new Metrics(this.config.metrics);
    let tracer = new Tracer(this.config.tracing);
    const requestTiming = new RequestTimingCollector(1000, metrics);
    const errorTracking = new ErrorTrackingCollector(1000, metrics);
    const prometheusExporter = new PrometheusExporter(metrics);

    let datadogExporter: DatadogExporter | undefined;
    if (this.config.datadog) {
      datadogExporter = new DatadogExporter(metrics, this.config.datadog);
    }

    // Setup trace export to Datadog
    if (datadogExporter) {
      tracer = new Tracer({
        ...this.config.tracing,
        onSpanEnd: (span) => {
          if (datadogExporter) {
            datadogExporter.recordSpan(span);
          }
        }
      });
    }

    this.context = {
      metrics,
      tracer,
      requestTiming,
      errorTracking,
      prometheusExporter,
      datadogExporter
    };

    // Call exporters
    for (const exporter of this.config.exporters) {
      exporter(this.context);
    }
  }

  /**
   * Get telemetry context
   */
  getContext(): TelemetryContext {
    return this.context;
  }

  /**
   * Get metrics
   */
  getMetrics(): Metrics {
    return this.context.metrics;
  }

  /**
   * Get tracer
   */
  getTracer(): Tracer {
    return this.context.tracer;
  }

  /**
   * Get request timing collector
   */
  getRequestTiming(): RequestTimingCollector {
    return this.context.requestTiming;
  }

  /**
   * Get error tracking collector
   */
  getErrorTracking(): ErrorTrackingCollector {
    return this.context.errorTracking;
  }

  /**
   * Export all telemetry data
   */
  export() {
    return {
      metrics: this.context.metrics.export(),
      traces: this.context.tracer.exportSpans(),
      errors: this.context.errorTracking.getAllErrors(),
      requestTimings: this.context.requestTiming.getStats()
    };
  }

  /**
   * Shutdown telemetry
   */
  async shutdown(): Promise<void> {
    if (this.context.datadogExporter) {
      // Final flush
      await this.context.datadogExporter.flush();
      this.context.datadogExporter.stop();
    }
  }
}

export const telemetry = new Telemetry({
  enabled: process.env.TELEMETRY_ENABLED !== 'false'
});

/**
 * Create a telemetry instance
 */
export function createTelemetry(config?: TelemetryConfig): Telemetry {
  return new Telemetry(config);
}

/**
 * Get global telemetry instance
 */
export function getTelemetry(): Telemetry {
  return telemetry;
}
