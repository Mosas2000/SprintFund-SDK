/**
 * Structured Logger
 * 
 * Provides structured logging with configurable levels and outputs.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  duration?: number;
}

export interface LoggerConfig {
  /**
   * Minimum log level
   */
  minLevel?: LogLevel;

  /**
   * Enable console output
   */
  console?: boolean;

  /**
   * Custom log handler
   */
  handler?: (entry: LogEntry) => void;

  /**
   * Maximum history size
   */
  maxHistory?: number;

  /**
   * Enable debug mode
   */
  debug?: boolean;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

export class Logger {
  private config: Required<LoggerConfig>;
  private history: LogEntry[] = [];

  constructor(config: LoggerConfig = {}) {
    this.config = {
      minLevel: config.minLevel || (process.env.DEBUG ? 'debug' : 'info'),
      console: config.console !== false,
      handler: config.handler,
      maxHistory: config.maxHistory || 1000,
      debug: config.debug || process.env.DEBUG === 'true'
    };
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  /**
   * Time an operation
   */
  time(label: string): () => void {
    const start = Date.now();

    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} took ${duration}ms`, { duration });
    };
  }

  /**
   * Get log history
   */
  getHistory(level?: LogLevel, limit?: number): LogEntry[] {
    let entries = this.history;

    if (level) {
      entries = entries.filter(e => LOG_LEVELS[e.level] >= LOG_LEVELS[level]);
    }

    if (limit) {
      entries = entries.slice(-limit);
    }

    return entries;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Enable debug mode
   */
  enableDebug(): void {
    this.config.debug = true;
    this.config.minLevel = 'debug';
  }

  /**
   * Disable debug mode
   */
  disableDebug(): void {
    this.config.debug = false;
    this.config.minLevel = 'info';
  }

  /**
   * Format log entry as string
   */
  formatEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    let output = `[${timestamp}] ${level} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      output += `\n${entry.error.stack}`;
    }

    return output;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    // Check minimum level
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      error
    };

    // Store in history
    this.history.push(entry);
    if (this.history.length > this.config.maxHistory) {
      this.history = this.history.slice(-this.config.maxHistory);
    }

    // Console output
    if (this.config.console) {
      const formatted = this.formatEntry(entry);
      const consoleMethod = level === 'error' ? console.error : console.log;
      consoleMethod(formatted);
    }

    // Custom handler
    if (this.config.handler) {
      this.config.handler(entry);
    }
  }
}

export const logger = new Logger({
  debug: process.env.DEBUG === 'true'
});

/**
 * Create a logger instance
 */
export function createLogger(config?: LoggerConfig): Logger {
  return new Logger(config);
}

/**
 * Create a scoped logger
 */
export function createScopedLogger(component: string, baseLogger: Logger = logger): Logger {
  const scoped = createLogger();

  return {
    debug: (msg, ctx) =>
      baseLogger.debug(`[${component}] ${msg}`, ctx),
    info: (msg, ctx) =>
      baseLogger.info(`[${component}] ${msg}`, ctx),
    warn: (msg, ctx) =>
      baseLogger.warn(`[${component}] ${msg}`, ctx),
    error: (msg, err, ctx) =>
      baseLogger.error(`[${component}] ${msg}`, err, ctx),
    time: (label) =>
      baseLogger.time(`[${component}] ${label}`),
    getHistory: (level, limit) =>
      baseLogger.getHistory(level, limit),
    clearHistory: () =>
      baseLogger.clearHistory(),
    setMinLevel: (level) =>
      baseLogger.setMinLevel(level),
    enableDebug: () =>
      baseLogger.enableDebug(),
    disableDebug: () =>
      baseLogger.disableDebug(),
    formatEntry: (entry) =>
      baseLogger.formatEntry(entry)
  } as Logger;
}
