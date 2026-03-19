/**
 * Readiness Probe
 * 
 * Determines if the service is ready to handle requests.
 */

import { HealthChecker } from './health-check';

export interface ReadinessProbeConfig {
  /**
   * Health checker instance
   */
  healthChecker: HealthChecker;

  /**
   * Critical services that must be healthy
   */
  criticalServices?: string[];

  /**
   * Optional services that can be degraded
   */
  optionalServices?: string[];

  /**
   * Custom readiness check
   */
  customCheck?: () => Promise<boolean>;
}

export class ReadinessProbe {
  private config: Required<ReadinessProbeConfig>;

  constructor(config: ReadinessProbeConfig) {
    this.config = {
      healthChecker: config.healthChecker,
      criticalServices: config.criticalServices || [],
      optionalServices: config.optionalServices || [],
      customCheck: config.customCheck || (() => Promise.resolve(true))
    };
  }

  /**
   * Check if service is ready
   */
  async isReady(): Promise<boolean> {
    // Run custom check
    const customReady = await this.config.customCheck();
    if (!customReady) return false;

    // Check critical services
    for (const service of this.config.criticalServices) {
      const result = this.config.healthChecker.getResult(service);
      if (!result || result.status === 'unhealthy') {
        return false;
      }
    }

    return true;
  }

  /**
   * Get readiness details
   */
  async getDetails(): Promise<{
    ready: boolean;
    critical: Record<string, string>;
    optional: Record<string, string>;
  }> {
    const ready = await this.isReady();
    const critical: Record<string, string> = {};
    const optional: Record<string, string> = {};

    for (const service of this.config.criticalServices) {
      const result = this.config.healthChecker.getResult(service);
      critical[service] = result?.status || 'unknown';
    }

    for (const service of this.config.optionalServices) {
      const result = this.config.healthChecker.getResult(service);
      optional[service] = result?.status || 'unknown';
    }

    return { ready, critical, optional };
  }

  /**
   * Create Express middleware
   */
  middleware() {
    return async (req: any, res: any, next: any) => {
      const ready = await this.isReady();

      if (ready) {
        res.status(200).json({
          ready: true,
          message: 'Service is ready'
        });
      } else {
        const details = await this.getDetails();
        res.status(503).json({
          ready: false,
          message: 'Service is not ready',
          details
        });
      }
    };
  }
}

/**
 * Liveness Probe
 * 
 * Determines if the service is alive (should continue running).
 */
export class LivenessProbe {
  private healthChecker: HealthChecker;

  constructor(healthChecker: HealthChecker) {
    this.healthChecker = healthChecker;
  }

  /**
   * Check if service is alive
   */
  async isAlive(): Promise<boolean> {
    const summary = this.healthChecker.getSummary();
    return summary.status !== 'unhealthy';
  }

  /**
   * Get liveness details
   */
  async getDetails(): Promise<{
    alive: boolean;
    summary: any;
  }> {
    const alive = await this.isAlive();
    const summary = this.healthChecker.getSummary();

    return { alive, summary };
  }

  /**
   * Create Express middleware
   */
  middleware() {
    return async (req: any, res: any, next: any) => {
      const alive = await this.isAlive();

      if (alive) {
        res.status(200).json({
          alive: true,
          message: 'Service is alive'
        });
      } else {
        const details = await this.getDetails();
        res.status(503).json({
          alive: false,
          message: 'Service is not alive',
          details
        });
      }
    };
  }
}

/**
 * Create a readiness probe
 */
export function createReadinessProbe(config: ReadinessProbeConfig): ReadinessProbe {
  return new ReadinessProbe(config);
}

/**
 * Create a liveness probe
 */
export function createLivenessProbe(healthChecker: HealthChecker): LivenessProbe {
  return new LivenessProbe(healthChecker);
}
