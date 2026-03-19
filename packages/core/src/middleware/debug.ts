/**
 * Debug Middleware
 * 
 * Express-compatible middleware for automatic instrumentation.
 */

import { Logger, logger as globalLogger } from './logger';
import { RequestInspector } from './request-inspector';
import { ResponseInspector } from './response-inspector';

export interface DebugMiddlewareOptions {
  /**
   * Logger instance
   */
  logger?: Logger;

  /**
   * Log request body
   */
  logBody?: boolean;

  /**
   * Log response body
   */
  logResponseBody?: boolean;

  /**
   * Maximum body size to log
   */
  maxBodySize?: number;

  /**
   * Skip certain paths
   */
  skip?: (req: any) => boolean;
}

/**
 * Create debug middleware for Express
 */
export function debugMiddleware(options: DebugMiddlewareOptions = {}) {
  const logger = options.logger || globalLogger;
  const logBody = options.logBody !== false;
  const logResponseBody = options.logResponseBody !== false;
  const maxBodySize = options.maxBodySize || 1000;
  const skip = options.skip || (() => false);

  return (req: any, res: any, next: any) => {
    // Skip if configured
    if (skip(req)) {
      return next();
    }

    // Inspect request
    const requestInfo = RequestInspector.inspect(req);

    logger.debug('Incoming request', {
      method: requestInfo.method,
      path: requestInfo.path,
      size: requestInfo.size,
      headers: logBody ? requestInfo.headers : undefined
    });

    // Capture response
    const startTime = Date.now();
    const originalJson = res.json;
    const originalSend = res.send;

    let responseBody: any;

    res.json = function(body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // Log on response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const responseInfo = ResponseInspector.inspect(
        {
          status: res.statusCode,
          headers: res.getHeaders?.(),
          body: logResponseBody ? responseBody : undefined
        },
        duration
      );

      logger.info('Request completed', {
        method: requestInfo.method,
        path: requestInfo.path,
        status: res.statusCode,
        duration,
        size: responseInfo.size
      });
    });

    next();
  };
}

/**
 * Create a contract call debug wrapper
 */
export function wrapContractCallWithDebug(
  fn: (...args: any[]) => Promise<any>,
  functionName: string,
  contractAddress: string,
  logger?: Logger
) {
  const log = logger || globalLogger;

  return async (...args: any[]) => {
    const startTime = Date.now();

    try {
      log.debug(`Calling ${functionName} on ${contractAddress}`, {
        args: args.map(a => {
          const str = JSON.stringify(a);
          return str.length > 100 ? str.substring(0, 100) + '...' : str;
        })
      });

      const result = await fn(...args);

      const duration = Date.now() - startTime;
      log.debug(`${functionName} succeeded`, {
        duration,
        resultSize: JSON.stringify(result).length
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      log.error(
        `${functionName} failed`,
        error instanceof Error ? error : new Error(String(error)),
        { duration }
      );

      throw error;
    }
  };
}

/**
 * Environment-based debug mode activation
 */
export function setupDebugMode(): void {
  if (process.env.DEBUG === 'true' || process.env.DEBUG_SDK === 'true') {
    globalLogger.enableDebug();
  }

  // Listen for debug env changes (for development)
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      if (process.env.DEBUG === 'true' || process.env.DEBUG_SDK === 'true') {
        globalLogger.enableDebug();
      }
    }, 5000);
  }
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled(): boolean {
  return process.env.DEBUG === 'true' || process.env.DEBUG_SDK === 'true';
}
