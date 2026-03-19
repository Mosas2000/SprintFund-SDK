/**
 * Request Signing for API Authentication
 * 
 * Provides HMAC-based request signing for secure API authentication.
 * Supports multiple signature algorithms and timestamp verification.
 */

import { createHmac } from 'crypto';

export interface SignatureConfig {
  /**
   * Secret key for signing
   */
  secret: string;

  /**
   * Signature algorithm (default: sha256)
   */
  algorithm?: 'sha256' | 'sha512';

  /**
   * Request timestamp tolerance in seconds (default: 300)
   */
  timestampTolerance?: number;
}

export interface SignedRequest {
  method: string;
  path: string;
  timestamp: number;
  signature: string;
  body?: string;
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
}

export class RequestSigner {
  private secret: string;
  private algorithm: 'sha256' | 'sha512';
  private timestampTolerance: number;

  constructor(config: SignatureConfig) {
    this.secret = config.secret;
    this.algorithm = config.algorithm || 'sha256';
    this.timestampTolerance = (config.timestampTolerance || 300) * 1000; // Convert to ms
  }

  /**
   * Sign a request with HMAC
   */
  sign(request: {
    method: string;
    path: string;
    body?: string;
    timestamp?: number;
  }): SignedRequest {
    const timestamp = request.timestamp || Date.now();
    const payload = this.createPayload(
      request.method,
      request.path,
      timestamp,
      request.body
    );

    const signature = this.createSignature(payload);

    return {
      method: request.method,
      path: request.path,
      timestamp,
      signature,
      body: request.body
    };
  }

  /**
   * Verify a signed request
   */
  verify(signedRequest: SignedRequest): VerificationResult {
    // Check timestamp
    const now = Date.now();
    const timeDiff = Math.abs(now - signedRequest.timestamp);

    if (timeDiff > this.timestampTolerance) {
      return {
        valid: false,
        reason: `Timestamp too old or in future. Difference: ${timeDiff}ms, tolerance: ${this.timestampTolerance}ms`
      };
    }

    // Verify signature
    const payload = this.createPayload(
      signedRequest.method,
      signedRequest.path,
      signedRequest.timestamp,
      signedRequest.body
    );

    const expectedSignature = this.createSignature(payload);

    if (expectedSignature !== signedRequest.signature) {
      return {
        valid: false,
        reason: 'Signature mismatch'
      };
    }

    return { valid: true };
  }

  /**
   * Generate signature headers for HTTP requests
   */
  generateHeaders(request: {
    method: string;
    path: string;
    body?: string;
  }): Record<string, string> {
    const signed = this.sign(request);

    return {
      'X-Signature': signed.signature,
      'X-Timestamp': signed.timestamp.toString(),
      'X-Signature-Algorithm': this.algorithm
    };
  }

  /**
   * Verify signature from HTTP headers
   */
  verifyHeaders(
    headers: Record<string, string>,
    request: {
      method: string;
      path: string;
      body?: string;
    }
  ): VerificationResult {
    const signature = headers['x-signature'] || headers['X-Signature'];
    const timestamp = headers['x-timestamp'] || headers['X-Timestamp'];
    const algorithm = headers['x-signature-algorithm'] || headers['X-Signature-Algorithm'];

    if (!signature || !timestamp) {
      return {
        valid: false,
        reason: 'Missing signature or timestamp header'
      };
    }

    if (algorithm && algorithm !== this.algorithm) {
      return {
        valid: false,
        reason: `Algorithm mismatch. Expected: ${this.algorithm}, got: ${algorithm}`
      };
    }

    const signedRequest: SignedRequest = {
      method: request.method,
      path: request.path,
      timestamp: parseInt(timestamp, 10),
      signature,
      body: request.body
    };

    return this.verify(signedRequest);
  }

  private createPayload(
    method: string,
    path: string,
    timestamp: number,
    body?: string
  ): string {
    const parts = [
      method.toUpperCase(),
      path,
      timestamp.toString()
    ];

    if (body) {
      parts.push(body);
    }

    return parts.join('\n');
  }

  private createSignature(payload: string): string {
    const hmac = createHmac(this.algorithm, this.secret);
    hmac.update(payload);
    return hmac.digest('hex');
  }

  /**
   * Rotate the signing secret
   */
  rotateSecret(newSecret: string): void {
    this.secret = newSecret;
  }
}

/**
 * Create a request signer with the given configuration
 */
export function createRequestSigner(config: SignatureConfig): RequestSigner {
  return new RequestSigner(config);
}

/**
 * Verify a webhook signature
 */
export function verifyWebhookSignature(
  secret: string,
  payload: string,
  signature: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): boolean {
  const hmac = createHmac(algorithm, secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}
