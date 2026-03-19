/**
 * Response Inspector
 * 
 * Captures and logs detailed response information.
 */

export interface ResponseInfo {
  status?: number;
  statusText?: string;
  headers?: Record<string, string | string[]>;
  body?: any;
  size?: number;
  duration: number;
  timestamp: number;
  error?: string;
}

export class ResponseInspector {
  /**
   * Inspect an HTTP response
   */
  static inspect(response: any, duration: number): ResponseInfo {
    const info: ResponseInfo = {
      duration,
      timestamp: Date.now()
    };

    // Status
    if (response.status) info.status = response.status;
    if (response.statusText) info.statusText = response.statusText;

    // Headers (redact sensitive info)
    if (response.headers) {
      info.headers = this.sanitizeHeaders(response.headers);
    }

    // Body (truncate large payloads)
    if (response.body) {
      info.body = this.truncateBody(response.body);
    }

    // Size
    if (response.headers?.['content-length']) {
      info.size = parseInt(response.headers['content-length'], 10);
    } else if (response.body) {
      info.size = JSON.stringify(response.body).length;
    }

    return info;
  }

  /**
   * Inspect a contract call result
   */
  static inspectContractResult(result: {
    ok: boolean;
    value?: any;
    error?: any;
  }, duration: number): ResponseInfo {
    return {
      status: result.ok ? 200 : 400,
      body: result.ok ? result.value : result.error,
      duration,
      timestamp: Date.now()
    };
  }

  /**
   * Inspect an error response
   */
  static inspectError(error: Error, duration: number): ResponseInfo {
    return {
      status: 500,
      error: error.message,
      body: {
        message: error.message,
        stack: error.stack
      },
      duration,
      timestamp: Date.now()
    };
  }

  /**
   * Sanitize headers
   */
  private static sanitizeHeaders(headers: Record<string, any>): Record<string, string | string[]> {
    const sanitized: Record<string, string | string[]> = {};
    const sensitiveKeys = ['set-cookie', 'authorization', 'x-auth-token'];

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
}

/**
 * Create a response inspector
 */
export function createResponseInspector(): typeof ResponseInspector {
  return ResponseInspector;
}
