/**
 * Health Check System
 * 
 * Monitors service health and readiness for orchestration platforms.
 */

export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded' | 'unknown';

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: number;
  duration: number;
  details?: Record<string, any>;
  error?: string;
}

export interface HealthCheckConfig {
  name: string;
  check: () => Promise<boolean>;
  timeout?: number;
  interval?: number;
}

export class HealthChecker {
  private checks: Map<string, HealthCheckConfig> = new Map();
  private results: Map<string, HealthCheckResult> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a health check
   */
  registerCheck(config: HealthCheckConfig): void {
    this.checks.set(config.name, config);
    this.results.set(config.name, {
      status: 'unknown',
      timestamp: Date.now(),
      duration: 0
    });
  }

  /**
   * Run a specific health check
   */
  async runCheck(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Health check not found: ${name}`);
    }

    const startTime = Date.now();

    try {
      const timeout = check.timeout || 5000;
      const result = await Promise.race([
        check.check(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), timeout)
        )
      ]);

      const duration = Date.now() - startTime;
      const healthResult: HealthCheckResult = {
        status: result ? 'healthy' : 'unhealthy',
        timestamp: Date.now(),
        duration
      };

      this.results.set(name, healthResult);
      return healthResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const healthResult: HealthCheckResult = {
        status: 'unhealthy',
        timestamp: Date.now(),
        duration,
        error: error instanceof Error ? error.message : String(error)
      };

      this.results.set(name, healthResult);
      return healthResult;
    }
  }

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();

    for (const name of this.checks.keys()) {
      const result = await this.runCheck(name);
      results.set(name, result);
    }

    return results;
  }

  /**
   * Get liveness status (is service running?)
   */
  async getLiveness(): Promise<HealthCheckResult> {
    const results = await this.runAllChecks();
    const allHealthy = Array.from(results.values()).every(r => r.status !== 'unhealthy');

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: Date.now(),
      duration: 0,
      details: Object.fromEntries(results)
    };
  }

  /**
   * Get readiness status (is service ready to accept traffic?)
   */
  async getReadiness(): Promise<HealthCheckResult> {
    const results = await this.runAllChecks();
    const criticalHealthy = Array.from(results.values())
      .slice(0, 1)
      .every(r => r.status !== 'unhealthy');

    return {
      status: criticalHealthy ? 'healthy' : 'unhealthy',
      timestamp: Date.now(),
      duration: 0,
      details: Object.fromEntries(results)
    };
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(interval: number = 30000): void {
    for (const [name, check] of this.checks.entries()) {
      const checkInterval = check.interval || interval;

      // Run immediately
      this.runCheck(name).catch(console.error);

      // Schedule periodic runs
      const timer = setInterval(() => {
        this.runCheck(name).catch(console.error);
      }, checkInterval);

      this.timers.set(name, timer);
    }
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
  }

  /**
   * Get all check results
   */
  getResults(): Map<string, HealthCheckResult> {
    return new Map(this.results);
  }

  /**
   * Get specific check result
   */
  getResult(name: string): HealthCheckResult | undefined {
    return this.results.get(name);
  }

  /**
   * Get overall health summary
   */
  getSummary(): {
    status: HealthStatus;
    checks: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  } {
    const results = Array.from(this.results.values());
    const healthy = results.filter(r => r.status === 'healthy').length;
    const unhealthy = results.filter(r => r.status === 'unhealthy').length;
    const degraded = results.filter(r => r.status === 'degraded').length;

    let status: HealthStatus;
    if (unhealthy > 0) {
      status = 'unhealthy';
    } else if (degraded > 0) {
      status = 'degraded';
    } else if (healthy === results.length) {
      status = 'healthy';
    } else {
      status = 'unknown';
    }

    return {
      status,
      checks: results.length,
      healthy,
      unhealthy,
      degraded
    };
  }

  /**
   * Clear all checks
   */
  clear(): void {
    this.stopPeriodicChecks();
    this.checks.clear();
    this.results.clear();
  }
}

/**
 * Create a health checker
 */
export function createHealthChecker(): HealthChecker {
  return new HealthChecker();
}

export const healthChecker = new HealthChecker();
