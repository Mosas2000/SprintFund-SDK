/**
 * Distributed Tracing System
 * 
 * OpenTelemetry-compatible tracing for request flow tracking.
 */

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  timestamp: number;
}

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'ok' | 'error' | 'pending';
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
  error?: Error;
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string | number>;
}

export interface TracerConfig {
  /**
   * Sampling rate for traces (0.0 to 1.0)
   */
  samplingRate?: number;

  /**
   * Maximum number of spans to keep in memory
   */
  maxSpans?: number;

  /**
   * Export handler for completed spans
   */
  onSpanEnd?: (span: Span) => void;
}

export class Tracer {
  private spans: Map<string, Span> = new Map();
  private currentSpan: Span | null = null;
  private config: Required<TracerConfig>;
  private samplingRate: number;

  constructor(config: TracerConfig = {}) {
    this.config = {
      samplingRate: config.samplingRate || 1.0,
      maxSpans: config.maxSpans || 1000,
      onSpanEnd: config.onSpanEnd
    };
    this.samplingRate = this.config.samplingRate;
  }

  /**
   * Start a new span
   */
  startSpan(name: string, attributes?: Record<string, string | number | boolean>): Span {
    const span: Span = {
      traceId: this.getOrCreateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId: this.currentSpan?.spanId,
      name,
      startTime: Date.now(),
      status: 'pending',
      attributes: attributes || {},
      events: []
    };

    const previousSpan = this.currentSpan;
    this.currentSpan = span;

    // Store for later export
    this.spans.set(span.spanId, span);
    if (this.spans.size > this.config.maxSpans) {
      const first = this.spans.keys().next().value;
      this.spans.delete(first);
    }

    return span;
  }

  /**
   * End the current span
   */
  endSpan(status: 'ok' | 'error' = 'ok', error?: Error): Span | null {
    if (!this.currentSpan) return null;

    this.currentSpan.endTime = Date.now();
    this.currentSpan.duration = this.currentSpan.endTime - this.currentSpan.startTime;
    this.currentSpan.status = status;
    this.currentSpan.error = error;

    const span = this.currentSpan;

    // Restore parent span
    if (span.parentSpanId) {
      this.currentSpan = this.spans.get(span.parentSpanId) || null;
    } else {
      this.currentSpan = null;
    }

    // Call export handler
    if (this.config.onSpanEnd) {
      this.config.onSpanEnd(span);
    }

    return span;
  }

  /**
   * Add event to current span
   */
  addEvent(
    name: string,
    attributes?: Record<string, string | number>
  ): void {
    if (!this.currentSpan) return;

    this.currentSpan.events.push({
      name,
      timestamp: Date.now(),
      attributes
    });
  }

  /**
   * Set attribute on current span
   */
  setAttribute(key: string, value: string | number | boolean): void {
    if (!this.currentSpan) return;
    this.currentSpan.attributes[key] = value;
  }

  /**
   * Execute function with automatic span management
   */
  async executeWithSpan<T>(
    name: string,
    fn: () => Promise<T>,
    attributes?: Record<string, string | number | boolean>
  ): Promise<T> {
    const span = this.startSpan(name, attributes);

    try {
      const result = await fn();
      this.endSpan('ok');
      return result;
    } catch (error) {
      this.endSpan('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Execute synchronous function with automatic span management
   */
  executeWithSpanSync<T>(
    name: string,
    fn: () => T,
    attributes?: Record<string, string | number | boolean>
  ): T {
    const span = this.startSpan(name, attributes);

    try {
      const result = fn();
      this.endSpan('ok');
      return result;
    } catch (error) {
      this.endSpan('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get current trace context for propagation
   */
  getCurrentContext(): TraceContext | null {
    if (!this.currentSpan) return null;

    return {
      traceId: this.currentSpan.traceId,
      spanId: this.currentSpan.spanId,
      parentSpanId: this.currentSpan.parentSpanId,
      timestamp: Date.now()
    };
  }

  /**
   * Extract spans from trace
   */
  getSpans(traceId?: string): Span[] {
    return Array.from(this.spans.values()).filter(
      span => !traceId || span.traceId === traceId
    );
  }

  /**
   * Export all spans
   */
  exportSpans(): Span[] {
    return Array.from(this.spans.values());
  }

  /**
   * Clear all spans
   */
  clear(): void {
    this.spans.clear();
    this.currentSpan = null;
  }

  private getOrCreateTraceId(): string {
    return this.currentSpan?.traceId || this.generateTraceId();
  }

  private generateTraceId(): string {
    const timestamp = Date.now().toString(16);
    const random = Math.random().toString(16).slice(2);
    return (timestamp + random).slice(0, 32);
  }

  private generateSpanId(): string {
    return Math.random().toString(16).slice(2).padEnd(16, '0').slice(0, 16);
  }

  private shouldSample(): boolean {
    return Math.random() < this.samplingRate;
  }
}

export const tracer = new Tracer();

/**
 * Create a tracer instance
 */
export function createTracer(config?: TracerConfig): Tracer {
  return new Tracer(config);
}

/**
 * Create a scoped tracer for a component
 */
export function createTracerScope(component: string) {
  return {
    startSpan: (name: string, attributes?: Record<string, string | number | boolean>) =>
      tracer.startSpan(`${component}.${name}`, attributes),
    endSpan: (status?: 'ok' | 'error', error?: Error) =>
      tracer.endSpan(status, error),
    addEvent: (name: string, attributes?: Record<string, string | number>) =>
      tracer.addEvent(`${component}.${name}`, attributes),
    setAttribute: (key: string, value: string | number | boolean) =>
      tracer.setAttribute(key, value),
    executeWithSpan: <T>(name: string, fn: () => Promise<T>, attributes?: Record<string, string | number | boolean>) =>
      tracer.executeWithSpan(`${component}.${name}`, fn, attributes),
    executeWithSpanSync: <T>(name: string, fn: () => T, attributes?: Record<string, string | number | boolean>) =>
      tracer.executeWithSpanSync(`${component}.${name}`, fn, attributes),
    getCurrentContext: () => tracer.getCurrentContext()
  };
}
