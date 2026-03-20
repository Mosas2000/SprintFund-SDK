/**
 * Audit Logging System for Compliance
 * 
 * Tracks all system actions for compliance and debugging.
 */

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'ADMIN';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditQuery {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

/**
 * Audit logger for compliance tracking
 */
export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 50000;

  /**
   * Log action
   */
  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now()
    };

    this.logs.push(fullEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    return fullEntry;
  }

  /**
   * Query logs
   */
  query(query: AuditQuery): AuditLogEntry[] {
    let results = this.logs;

    if (query.userId) {
      results = results.filter((l) => l.userId === query.userId);
    }

    if (query.action) {
      results = results.filter((l) => l.action === query.action);
    }

    if (query.resource) {
      results = results.filter((l) => l.resource === query.resource);
    }

    if (query.startTime && query.endTime) {
      results = results.filter((l) => l.timestamp >= query.startTime! && l.timestamp <= query.endTime!);
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return results.slice(offset, offset + limit);
  }

  /**
   * Export logs
   */
  exportCsv(): string {
    const headers = [
      'id',
      'timestamp',
      'userId',
      'action',
      'resource',
      'resourceId',
      'status',
      'errorMessage'
    ];

    const rows = [headers.join(',')];

    for (const log of this.logs) {
      rows.push(
        [
          log.id,
          log.timestamp,
          log.userId || '',
          log.action,
          log.resource,
          log.resourceId || '',
          log.status,
          log.errorMessage || ''
        ]
          .map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v))
          .join(',')
      );
    }

    return rows.join('\n');
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalLogs: number;
    byAction: Record<string, number>;
    byStatus: Record<string, number>;
    byResource: Record<string, number>;
  } {
    const byAction: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byResource: Record<string, number> = {};

    for (const log of this.logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byStatus[log.status] = (byStatus[log.status] || 0) + 1;
      byResource[log.resource] = (byResource[log.resource] || 0) + 1;
    }

    return {
      totalLogs: this.logs.length,
      byAction,
      byStatus,
      byResource
    };
  }
}

export function createAuditLogger(): AuditLogger {
  return new AuditLogger();
}

export const globalAuditLogger = new AuditLogger();
