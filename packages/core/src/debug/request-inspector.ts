/**
 * Request Inspector
 * 
 * Captures and logs detailed request information.
 */

export interface RequestInfo {
  method: string;
  path?: string;
  url?: string;
  headers?: Record<string, string | string[]>;
  query?: Record<string, any>;
  params?: Record<string, any>;
  body?: any;
  size?: number;
  timestamp: number;
}

export class RequestInspector {
  /**
   * Inspect an HTTP request
   */
  static inspect(request: any): RequestInfo {
    const info: RequestInfo = {
      method: request.method || 'UNKNOWN',
      timestamp: Date.now()
    };

    // URL info
    if (request.path) info.path = request.path;
    if (request.url) info.url = request.url;

    // Headers (redact sensitive info)
    if (request.headers) {
      info.headers = this.sanitizeHeaders(request.headers);
    }

    // Query params
    if (request.query) {
      info.query = request.query;
    }

    // URL params
    if (request.params) {
      info.params = request.params;
    }

    // Body (truncate large payloads)
    if (request.body) {
      info.body = this.truncateBody(request.body);
    }

    // Content length
    if (request.headers?.['content-length']) {
      info.size = parseInt(request.headers['content-length'], 10);
    } else if (request.body) {
      info.size = JSON.stringify(request.body).length;
    }

    return info;
  }

  /**
   * Inspect contract call request
   */
  static inspectContractCall(call: {
    functionName: string;
    args: any[];
    contractAddress?: string;
  }): RequestInfo {
    return {
      method: 'CONTRACT_CALL',
      path: call.contractAddress,
      body: {
        function: call.functionName,
        args: call.args.map(arg => this.truncateValue(arg))
      },
      timestamp: Date.now()
    };
  }

  /**
   * Sanitize headers by removing sensitive information
   */
  private static sanitizeHeaders(headers: Record<string, any>): Record<string, string | string[]> {
    const sanitized: Record<string, string | string[]> = {};
    const sensitiveKeys = ['authorization', 'cookie', 'x-api-key', 'x-auth-token', 'password'];

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Truncate large body values
   */
  private static truncateBody(body: any, maxSize: number = 1000): any {
    if (typeof body !== 'object') {
      return body;
    }

    const str = JSON.stringify(body);
    if (str.length > maxSize) {
      return `${str.substring(0, maxSize)}... (truncated)`;
    }

    return body;
  }

  /**
   * Truncate individual values
   */
  private static truncateValue(value: any, maxSize: number = 100): any {
    if (typeof value === 'string' && value.length > maxSize) {
      return `${value.substring(0, maxSize)}...`;
    }

    if (typeof value === 'object' && value !== null) {
      const str = JSON.stringify(value);
      if (str.length > maxSize) {
        return `${str.substring(0, maxSize)}...`;
      }
    }

    return value;
  }
}

/**
 * Create a request inspector
 */
export function createRequestInspector(): typeof RequestInspector {
  return RequestInspector;
}
