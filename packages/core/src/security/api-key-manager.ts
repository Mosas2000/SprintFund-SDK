/**
 * API Key Manager
 * 
 * Manages API keys with rotation, expiration, and permission scopes.
 */

import { randomBytes, createHash } from 'crypto';

export interface APIKey {
  id: string;
  key: string;
  hashedKey: string;
  name: string;
  scopes: string[];
  createdAt: number;
  expiresAt?: number;
  lastUsedAt?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface CreateKeyOptions {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
  metadata?: Record<string, any>;
}

export interface ValidateKeyResult {
  valid: boolean;
  key?: APIKey;
  reason?: string;
}

export class APIKeyManager {
  private keys: Map<string, APIKey> = new Map();
  private hashedKeyIndex: Map<string, string> = new Map(); // hashedKey -> keyId

  /**
   * Create a new API key
   */
  createKey(options: CreateKeyOptions): APIKey {
    const id = this.generateId();
    const key = this.generateKey();
    const hashedKey = this.hashKey(key);

    const expiresAt = options.expiresInDays
      ? Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000
      : undefined;

    const apiKey: APIKey = {
      id,
      key,
      hashedKey,
      name: options.name,
      scopes: options.scopes || [],
      createdAt: Date.now(),
      expiresAt,
      isActive: true,
      metadata: options.metadata
    };

    this.keys.set(id, apiKey);
    this.hashedKeyIndex.set(hashedKey, id);

    return apiKey;
  }

  /**
   * Validate an API key
   */
  validate(key: string, requiredScope?: string): ValidateKeyResult {
    const hashedKey = this.hashKey(key);
    const keyId = this.hashedKeyIndex.get(hashedKey);

    if (!keyId) {
      return {
        valid: false,
        reason: 'Invalid API key'
      };
    }

    const apiKey = this.keys.get(keyId);
    if (!apiKey) {
      return {
        valid: false,
        reason: 'Key not found'
      };
    }

    // Check if active
    if (!apiKey.isActive) {
      return {
        valid: false,
        key: apiKey,
        reason: 'Key has been revoked'
      };
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
      return {
        valid: false,
        key: apiKey,
        reason: 'Key has expired'
      };
    }

    // Check scope
    if (requiredScope && !apiKey.scopes.includes(requiredScope)) {
      return {
        valid: false,
        key: apiKey,
        reason: `Missing required scope: ${requiredScope}`
      };
    }

    // Update last used timestamp
    apiKey.lastUsedAt = Date.now();

    return {
      valid: true,
      key: apiKey
    };
  }

  /**
   * Revoke an API key
   */
  revokeKey(keyId: string): boolean {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return false;

    apiKey.isActive = false;
    return true;
  }

  /**
   * Delete an API key permanently
   */
  deleteKey(keyId: string): boolean {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return false;

    this.hashedKeyIndex.delete(apiKey.hashedKey);
    this.keys.delete(keyId);
    return true;
  }

  /**
   * Rotate an API key (creates new key, revokes old)
   */
  rotateKey(keyId: string): APIKey | null {
    const oldKey = this.keys.get(keyId);
    if (!oldKey) return null;

    // Create new key with same properties
    const newKey = this.createKey({
      name: oldKey.name + ' (rotated)',
      scopes: oldKey.scopes,
      expiresInDays: oldKey.expiresAt
        ? Math.ceil((oldKey.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
        : undefined,
      metadata: oldKey.metadata
    });

    // Revoke old key
    this.revokeKey(keyId);

    return newKey;
  }

  /**
   * Get API key by ID
   */
  getKey(keyId: string): APIKey | undefined {
    return this.keys.get(keyId);
  }

  /**
   * List all API keys
   */
  listKeys(filters?: {
    active?: boolean;
    scope?: string;
  }): APIKey[] {
    let keys = Array.from(this.keys.values());

    if (filters) {
      if (filters.active !== undefined) {
        keys = keys.filter(k => k.isActive === filters.active);
      }

      if (filters.scope) {
        keys = keys.filter(k => k.scopes.includes(filters.scope));
      }
    }

    // Return keys without the actual key value for security
    return keys.map(k => ({
      ...k,
      key: '***' // Redact actual key
    }));
  }

  /**
   * Add scope to an existing key
   */
  addScope(keyId: string, scope: string): boolean {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return false;

    if (!apiKey.scopes.includes(scope)) {
      apiKey.scopes.push(scope);
    }

    return true;
  }

  /**
   * Remove scope from an existing key
   */
  removeScope(keyId: string, scope: string): boolean {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return false;

    apiKey.scopes = apiKey.scopes.filter(s => s !== scope);
    return true;
  }

  /**
   * Update key metadata
   */
  updateMetadata(keyId: string, metadata: Record<string, any>): boolean {
    const apiKey = this.keys.get(keyId);
    if (!apiKey) return false;

    apiKey.metadata = { ...apiKey.metadata, ...metadata };
    return true;
  }

  /**
   * Clean up expired keys
   */
  cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [keyId, apiKey] of this.keys.entries()) {
      if (apiKey.expiresAt && apiKey.expiresAt < now) {
        this.deleteKey(keyId);
        cleaned++;
      }
    }

    return cleaned;
  }

  private generateId(): string {
    return 'sfp_' + randomBytes(16).toString('hex');
  }

  private generateKey(): string {
    return 'sk_' + randomBytes(32).toString('base64url');
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}

/**
 * Pre-defined scope constants
 */
export const APIScopes = {
  READ_PROPOSALS: 'proposals:read',
  WRITE_PROPOSALS: 'proposals:write',
  READ_VOTES: 'votes:read',
  WRITE_VOTES: 'votes:write',
  READ_STAKES: 'stakes:read',
  WRITE_STAKES: 'stakes:write',
  READ_ANALYTICS: 'analytics:read',
  ADMIN: 'admin:*'
} as const;

/**
 * Create an API key manager
 */
export function createAPIKeyManager(): APIKeyManager {
  return new APIKeyManager();
}
