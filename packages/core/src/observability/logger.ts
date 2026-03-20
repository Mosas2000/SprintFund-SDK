/**
 * Structured logging and observability system with context propagation
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  traceId: string;
  spanId: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  tags?: Record<string, string>;
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: Record<string, any>;
  error?: { name: string; message: string; stack?: string };
}

/**
 * Context-aware logger with structured output
 */
export class StructuredLogger {
  private context: LogContext;
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
    this.context = {
      traceId: this.generateId(),
      spanId: this.generateId(),
    };
  }

  setContext(partial: Partial<LogContext>): void {
    this.context = { ...this.context, ...partial };
  }

  getContext(): LogContext {
    return { ...this.context };
  }

  debug(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error, data?: Record<string, any>): void {
    const errorData: any = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      message,
      context: this.context,
      data,
      error: errorData,
    };

    this.emitLog(entry);
  }

  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context: this.context,
      data,
    };

    this.emitLog(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private emitLog(entry: LogEntry): void {
    const output = {
      ts: new Date(entry.timestamp).toISOString(),
      level: entry.level,
      msg: entry.message,
      traceId: entry.context.traceId,
      spanId: entry.context.spanId,
      ...entry.context.tags,
      ...entry.data,
      ...(entry.error && { err: entry.error }),
    };

    if (typeof console !== 'undefined') {
      const method = entry.level === LogLevel.ERROR ? console.error :
                     entry.level === LogLevel.WARN ? console.warn :
                     entry.level === LogLevel.DEBUG ? console.debug :
                     console.log;
      method(JSON.stringify(output));
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Metrics collector for observability
 */
export interface Metric {
  name: string;
  value: number;
  unit?: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export class MetricsCollector {
  private metrics: Metric[] = [];
  private maxMetrics = 10000;

  record(name: string, value: number, unit?: string, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  histogram(name: string, values: number[], tags?: Record<string, string>): void {
    if (values.length === 0) return;

    const sorted = [...values].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    this.record(`${name}.p50`, p50, 'ms', tags);
    this.record(`${name}.p95`, p95, 'ms', tags);
    this.record(`${name}.p99`, p99, 'ms', tags);
    this.record(`${name}.min`, min, 'ms', tags);
    this.record(`${name}.max`, max, 'ms', tags);
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.record(name, value, undefined, tags);
  }

  counter(name: string, increment = 1, tags?: Record<string, string>): void {
    this.record(name, increment, 'count', tags);
  }

  getMetrics(name?: string): Metric[] {
    if (!name) return [...this.metrics];
    return this.metrics.filter(m => m.name === name);
  }

  clear(): void {
    this.metrics = [];
  }

  getStats(name: string): { count: number; sum: number; avg: number; min: number; max: number } | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
}

/**
 * Health check system for service monitoring
 */
export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  duration?: number;
  error?: string;
}

export class HealthChecker {
  private checks = new Map<string, () => Promise<boolean>>();
  private lastResults = new Map<string, HealthCheckResult>();

  register(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  async check(name?: string): Promise<HealthCheckResult[]> {
    const checksToRun = name ? [[name, this.checks.get(name)!]] : Array.from(this.checks.entries());
    const results: HealthCheckResult[] = [];

    for (const [checkName, checkFn] of checksToRun) {
      const startTime = Date.now();
      let result: HealthCheckResult;

      try {
        const healthy = await Promise.race([
          checkFn(),
          new Promise<false>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          ),
        ]);

        result = {
          name: checkName,
          status: healthy ? 'healthy' : 'degraded',
          duration: Date.now() - startTime,
        };
      } catch (error) {
        result = {
          name: checkName,
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
        };
      }

      results.push(result);
      this.lastResults.set(checkName, result);
    }

    return results;
  }

  getStatus(): Record<string, HealthCheckResult> {
    return Object.fromEntries(this.lastResults);
  }

  isHealthy(): boolean {
    return Array.from(this.lastResults.values()).every(r => r.status === 'healthy');
  }
}

/**
 * Request interceptor for observability
 */
export class RequestObserver {
  private logger: StructuredLogger;
  private metrics: MetricsCollector;

  constructor(logger: StructuredLogger, metrics: MetricsCollector) {
    this.logger = logger;
    this.metrics = metrics;
  }

  async observe<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    const spanId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.debug(`Starting: ${name}`, { spanId, ...tags });

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.metrics.record(`${name}.duration`, duration, 'ms', tags);
      this.metrics.counter(`${name}.success`, 1, tags);

      this.logger.info(`Completed: ${name}`, { spanId, duration, ...tags });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.metrics.record(`${name}.duration`, duration, 'ms', tags);
      this.metrics.counter(`${name}.error`, 1, tags);

      this.logger.error(`Failed: ${name}`, error instanceof Error ? error : new Error(String(error)), {
        spanId,
        duration,
        ...tags,
      });

      throw error;
    }
  }
}

// Global instances
const globalLogger = new StructuredLogger(LogLevel.INFO);
const globalMetrics = new MetricsCollector();
const globalHealthChecker = new HealthChecker();

export function createLogger(minLevel?: LogLevel): StructuredLogger {
  return new StructuredLogger(minLevel);
}

export function createMetricsCollector(): MetricsCollector {
  return new MetricsCollector();
}

export function createHealthChecker(): HealthChecker {
  return new HealthChecker();
}

export function createRequestObserver(
  logger?: StructuredLogger,
  metrics?: MetricsCollector
): RequestObserver {
  return new RequestObserver(logger ?? globalLogger, metrics ?? globalMetrics);
}

export {
  globalLogger,
  globalMetrics,
  globalHealthChecker,
};
