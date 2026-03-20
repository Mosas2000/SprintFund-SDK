import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLogger, createAuditLogger, AuditAction } from '../audit/audit-logger';

describe('Audit Logging (Phase 3.12)', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = createAuditLogger();
  });

  it('should log actions', () => {
    const entry = logger.log({
      userId: 'user-1',
      action: 'CREATE',
      resource: 'proposal',
      resourceId: 'prop-1',
      status: 'SUCCESS'
    });

    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.action).toBe('CREATE');
  });

  it('should query by userId', () => {
    logger.log({
      userId: 'user-1',
      action: 'CREATE',
      resource: 'proposal',
      status: 'SUCCESS'
    });

    logger.log({
      userId: 'user-2',
      action: 'READ',
      resource: 'proposal',
      status: 'SUCCESS'
    });

    const results = logger.query({ userId: 'user-1' });
    expect(results).toHaveLength(1);
    expect(results[0].userId).toBe('user-1');
  });

  it('should query by action', () => {
    logger.log({
      userId: 'user-1',
      action: 'CREATE',
      resource: 'proposal',
      status: 'SUCCESS'
    });

    logger.log({
      userId: 'user-1',
      action: 'UPDATE',
      resource: 'proposal',
      status: 'SUCCESS'
    });

    const results = logger.query({ action: 'CREATE' });
    expect(results.length).toBeGreaterThan(0);
  });

  it('should export to CSV', () => {
    logger.log({
      userId: 'user-1',
      action: 'CREATE',
      resource: 'proposal',
      status: 'SUCCESS'
    });

    const csv = logger.exportCsv();
    expect(csv).toContain('id');
    expect(csv).toContain('CREATE');
  });

  it('should get statistics', () => {
    logger.log({
      userId: 'user-1',
      action: 'CREATE',
      resource: 'proposal',
      status: 'SUCCESS'
    });

    const stats = logger.getStats();
    expect(stats.totalLogs).toBe(1);
    expect(stats.byAction.CREATE).toBe(1);
    expect(stats.byStatus.SUCCESS).toBe(1);
  });
});
