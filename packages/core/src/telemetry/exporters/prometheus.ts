/**
 * Prometheus Metrics Exporter
 * 
 * Exports metrics in Prometheus text format.
 */

import { Metrics } from '../metrics';

export interface PrometheusMetricPoint {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  samples: Array<{
    name: string;
    labels: Record<string, string>;
    value: number;
    timestamp?: number;
  }>;
}

export class PrometheusExporter {
  private metrics: Metrics;
  private registry: Map<string, PrometheusMetricPoint> = new Map();

  constructor(metrics: Metrics) {
    this.metrics = metrics;
  }

  /**
   * Register a metric for export
   */
  registerMetric(
    name: string,
    help: string,
    type: 'counter' | 'gauge' | 'histogram' | 'summary' = 'counter'
  ): void {
    this.registry.set(name, {
      name,
      help,
      type,
      samples: []
    });
  }

  /**
   * Export metrics in Prometheus format
   */
  export(): string {
    const lines: string[] = [];

    const metricData = this.metrics.export();

    // Group by metric name
    const grouped = new Map<string, typeof metricData>();
    for (const data of metricData) {
      if (!grouped.has(data.name)) {
        grouped.set(data.name, []);
      }
      grouped.get(data.name)!.push(data);
    }

    // Export each metric
    for (const [name, metrics] of grouped) {
      const registered = this.registry.get(name);
      
      // Add HELP and TYPE comments
      if (registered) {
        lines.push(`# HELP ${name} ${registered.help}`);
        lines.push(`# TYPE ${name} ${registered.type}`);
      }

      // Add samples
      for (const metric of metrics) {
        for (const value of metric.values) {
          const labels = this.formatLabels(value.attributes || {});
          lines.push(`${name}${labels} ${value.value}`);
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Create a metrics server response
   */
  getMetricsResponse(): { contentType: string; body: string } {
    return {
      contentType: 'text/plain; version=0.0.4',
      body: this.export()
    };
  }

  /**
   * Clear registry
   */
  clearRegistry(): void {
    this.registry.clear();
  }

  private formatLabels(attributes: Record<string, string | number>): string {
    const keys = Object.keys(attributes).sort();

    if (keys.length === 0) {
      return '';
    }

    const pairs = keys.map(key => {
      const value = String(attributes[key]).replace(/"/g, '\\"');
      return `${key}="${value}"`;
    });

    return `{${pairs.join(',')}}`;
  }
}

/**
 * Create a Prometheus exporter
 */
export function createPrometheusExporter(metrics: Metrics): PrometheusExporter {
  return new PrometheusExporter(metrics);
}

/**
 * Export metrics endpoint for Express
 */
export function prometheusMetricsEndpoint(exporter: PrometheusExporter) {
  return (req: any, res: any) => {
    const response = exporter.getMetricsResponse();
    res.set('Content-Type', response.contentType);
    res.send(response.body);
  };
}
