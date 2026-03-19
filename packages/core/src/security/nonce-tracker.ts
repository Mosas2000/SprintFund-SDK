/**
 * Nonce Tracker for Transaction Replay Protection
 * 
 * Tracks used nonces to prevent replay attacks in transaction submissions.
 */

export interface NonceConfig {
  /**
   * Time window for nonce validity in milliseconds (default: 5 minutes)
   */
  validityWindow?: number;

  /**
   * Maximum number of nonces to track per address (default: 1000)
   */
  maxNoncesPerAddress?: number;
}

export interface NonceValidation {
  valid: boolean;
  reason?: string;
}

interface NonceRecord {
  nonce: string;
  timestamp: number;
  used: boolean;
}

export class NonceTracker {
  private nonces: Map<string, Map<string, NonceRecord>> = new Map(); // address -> nonce -> record
  private validityWindow: number;
  private maxNoncesPerAddress: number;

  constructor(config: NonceConfig = {}) {
    this.validityWindow = config.validityWindow || 5 * 60 * 1000; // 5 minutes
    this.maxNoncesPerAddress = config.maxNoncesPerAddress || 1000;
  }

  /**
   * Generate a new nonce
   */
  generateNonce(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  /**
   * Register a nonce for later use
   */
  registerNonce(address: string, nonce: string): void {
    let addressNonces = this.nonces.get(address);

    if (!addressNonces) {
      addressNonces = new Map();
      this.nonces.set(address, addressNonces);
    }

    // Clean up old nonces if limit exceeded
    if (addressNonces.size >= this.maxNoncesPerAddress) {
      this.cleanupOldNonces(address);
    }

    addressNonces.set(nonce, {
      nonce,
      timestamp: Date.now(),
      used: false
    });
  }

  /**
   * Validate and mark a nonce as used
   */
  validateAndUse(address: string, nonce: string): NonceValidation {
    const addressNonces = this.nonces.get(address);

    if (!addressNonces) {
      return {
        valid: false,
        reason: 'No nonces registered for this address'
      };
    }

    const record = addressNonces.get(nonce);

    if (!record) {
      return {
        valid: false,
        reason: 'Nonce not found'
      };
    }

    // Check if already used
    if (record.used) {
      return {
        valid: false,
        reason: 'Nonce already used (replay attack detected)'
      };
    }

    // Check validity window
    const now = Date.now();
    const age = now - record.timestamp;

    if (age > this.validityWindow) {
      return {
        valid: false,
        reason: `Nonce expired (age: ${age}ms, limit: ${this.validityWindow}ms)`
      };
    }

    // Mark as used
    record.used = true;

    return { valid: true };
  }

  /**
   * Check if a nonce is valid without marking it as used
   */
  check(address: string, nonce: string): NonceValidation {
    const addressNonces = this.nonces.get(address);

    if (!addressNonces) {
      return {
        valid: false,
        reason: 'No nonces registered for this address'
      };
    }

    const record = addressNonces.get(nonce);

    if (!record) {
      return {
        valid: false,
        reason: 'Nonce not found'
      };
    }

    if (record.used) {
      return {
        valid: false,
        reason: 'Nonce already used'
      };
    }

    const now = Date.now();
    const age = now - record.timestamp;

    if (age > this.validityWindow) {
      return {
        valid: false,
        reason: 'Nonce expired'
      };
    }

    return { valid: true };
  }

  /**
   * Get nonce status
   */
  getStatus(address: string, nonce: string): {
    exists: boolean;
    used: boolean;
    age?: number;
    expired?: boolean;
  } {
    const addressNonces = this.nonces.get(address);

    if (!addressNonces) {
      return { exists: false, used: false };
    }

    const record = addressNonces.get(nonce);

    if (!record) {
      return { exists: false, used: false };
    }

    const age = Date.now() - record.timestamp;
    const expired = age > this.validityWindow;

    return {
      exists: true,
      used: record.used,
      age,
      expired
    };
  }

  /**
   * Revoke a specific nonce
   */
  revokeNonce(address: string, nonce: string): boolean {
    const addressNonces = this.nonces.get(address);
    if (!addressNonces) return false;

    return addressNonces.delete(nonce);
  }

  /**
   * Clear all nonces for an address
   */
  clearAddress(address: string): boolean {
    return this.nonces.delete(address);
  }

  /**
   * Get statistics for an address
   */
  getStats(address: string): {
    total: number;
    used: number;
    unused: number;
    expired: number;
  } {
    const addressNonces = this.nonces.get(address);

    if (!addressNonces) {
      return { total: 0, used: 0, unused: 0, expired: 0 };
    }

    const now = Date.now();
    let used = 0;
    let unused = 0;
    let expired = 0;

    for (const record of addressNonces.values()) {
      if (record.used) {
        used++;
      } else {
        unused++;
      }

      const age = now - record.timestamp;
      if (age > this.validityWindow) {
        expired++;
      }
    }

    return {
      total: addressNonces.size,
      used,
      unused,
      expired
    };
  }

  /**
   * Clean up expired and used nonces
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [address, addressNonces] of this.nonces.entries()) {
      for (const [nonce, record] of addressNonces.entries()) {
        const age = now - record.timestamp;
        
        // Remove if expired or used
        if (age > this.validityWindow || record.used) {
          addressNonces.delete(nonce);
          cleaned++;
        }
      }

      // Remove address entry if no nonces left
      if (addressNonces.size === 0) {
        this.nonces.delete(address);
      }
    }

    return cleaned;
  }

  private cleanupOldNonces(address: string): void {
    const addressNonces = this.nonces.get(address);
    if (!addressNonces) return;

    const now = Date.now();
    const sorted = Array.from(addressNonces.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest 25% or expired
    const toRemove = Math.floor(sorted.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [nonce, record] = sorted[i];
      const age = now - record.timestamp;
      
      if (record.used || age > this.validityWindow) {
        addressNonces.delete(nonce);
      }
    }
  }
}

/**
 * Create a nonce tracker with the given configuration
 */
export function createNonceTracker(config?: NonceConfig): NonceTracker {
  return new NonceTracker(config);
}
