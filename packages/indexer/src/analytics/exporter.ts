/**
 * Analytics Exporter for Third-party Services
 */

export interface ExportOptions {
  /**
   * Format: 'json', 'csv'
   */
  format?: 'json' | 'csv';

  /**
   * Include timestamps
   */
  includeTimestamps?: boolean;

  /**
   * Pretty print
   */
  pretty?: boolean;
}

export interface ExportTarget {
  /**
   * Target name
   */
  name: string;

  /**
   * Export URL
   */
  url: string;

  /**
   * API key
   */
  apiKey?: string;

  /**
   * Export interval (ms)
   */
  interval?: number;

  /**
   * Enabled
   */
  enabled: boolean;
}

/**
 * Analytics data exporter
 */
export class AnalyticsExporter {
  private targets: Map<string, ExportTarget> = new Map();
  private exportIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register export target
   */
  registerTarget(target: ExportTarget): void {
    this.targets.set(target.name, target);

    if (target.enabled && target.interval) {
      this.startExport(target.name);
    }
  }

  /**
   * Remove export target
   */
  removeTarget(name: string): void {
    this.stopExport(name);
    this.targets.delete(name);
  }

  /**
   * Start periodic export
   */
  startExport(targetName: string): void {
    const target = this.targets.get(targetName);
    if (!target) throw new Error(`Target ${targetName} not found`);

    if (this.exportIntervals.has(targetName)) {
      return; // Already running
    }

    const interval = target.interval || 60000; // Default 1 minute

    const timer = setInterval(async () => {
      try {
        await this.exportData(targetName);
      } catch (error) {
        console.error(`Export to ${targetName} failed:`, error);
      }
    }, interval);

    this.exportIntervals.set(targetName, timer);
  }

  /**
   * Stop periodic export
   */
  stopExport(targetName: string): void {
    const interval = this.exportIntervals.get(targetName);
    if (interval) {
      clearInterval(interval);
      this.exportIntervals.delete(targetName);
    }
  }

  /**
   * Export data to target
   */
  async exportData(
    targetName: string,
    data?: Record<string, any>,
    options?: ExportOptions
  ): Promise<void> {
    const target = this.targets.get(targetName);
    if (!target) throw new Error(`Target ${targetName} not found`);

    const payload = this.formatData(data || {}, options);

    try {
      const response = await fetch(target.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(target.apiKey && { Authorization: `Bearer ${target.apiKey}` })
        },
        body: payload
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to export to ${target.name}:`, error);
      throw error;
    }
  }

  /**
   * Export to multiple targets
   */
  async exportToAll(data?: Record<string, any>, options?: ExportOptions): Promise<void> {
    const promises = Array.from(this.targets.values())
      .filter((t) => t.enabled)
      .map((t) => this.exportData(t.name, data, options));

    await Promise.allSettled(promises);
  }

  /**
   * Get registered targets
   */
  getTargets(): ExportTarget[] {
    return Array.from(this.targets.values());
  }

  /**
   * Format data for export
   */
  private formatData(data: Record<string, any>, options?: ExportOptions): string {
    const format = options?.format ?? 'json';
    const pretty = options?.pretty ?? true;

    if (format === 'csv') {
      return this.toCsv(data);
    }

    // JSON format
    const formatted = {
      ...data,
      ...(options?.includeTimestamps && { exportedAt: new Date().toISOString() })
    };

    return pretty ? JSON.stringify(formatted, null, 2) : JSON.stringify(formatted);
  }

  /**
   * Convert to CSV
   */
  private toCsv(data: Record<string, any>): string {
    // Simple CSV conversion
    const rows = [Object.keys(data).join(',')];

    const values = Object.values(data);
    rows.push(
      values
        .map((v) => {
          if (typeof v === 'string' && v.includes(',')) {
            return `"${v}"`;
          }
          return String(v);
        })
        .join(',')
    );

    return rows.join('\n');
  }
}

/**
 * Create analytics exporter
 */
export function createAnalyticsExporter(): AnalyticsExporter {
  return new AnalyticsExporter();
}

/**
 * Common export targets
 */
export const CommonTargets = {
  datadog: (apiKey: string, site: string = 'datadoghq.com') => ({
    name: 'datadog',
    url: `https://api.${site}/api/v1/events`,
    apiKey,
    enabled: true
  }),

  mixpanel: (token: string) => ({
    name: 'mixpanel',
    url: 'https://api.mixpanel.com/track',
    apiKey: token,
    enabled: true
  }),

  segment: (writeKey: string) => ({
    name: 'segment',
    url: 'https://api.segment.io/v1/track',
    apiKey: writeKey,
    enabled: true
  })
};
