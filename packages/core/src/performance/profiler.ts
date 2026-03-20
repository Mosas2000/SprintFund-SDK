/**
 * Performance profiling and optimization utilities
 */

export interface Profile {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  memory?: { heapUsed: number; heapTotal: number };
  marks?: { [key: string]: number };
}

/**
 * Performance profiler for operation timing
 */
export class PerformanceProfiler {
  private profiles: Map<string, Profile> = new Map();
  private marks: Map<string, number> = new Map();
  private startTime = Date.now();

  mark(name: string): void {
    this.marks.set(name, Date.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      throw new Error(`Mark ${startMark} not found`);
    }

    const end = endMark ? this.marks.get(endMark) : Date.now();
    if (endMark && !end) {
      throw new Error(`Mark ${endMark} not found`);
    }

    const duration = (end ?? Date.now()) - start;

    const profile: Profile = {
      name,
      duration,
      startTime: start,
      endTime: end ?? Date.now(),
      marks: Object.fromEntries(this.marks),
    };

    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      profile.memory = {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
      };
    }

    this.profiles.set(name, profile);
    return duration;
  }

  async profile<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startMark = `${name}-start-${Date.now()}`;
    const endMark = `${name}-end-${Date.now()}`;

    this.mark(startMark);
    const result = await fn();
    this.mark(endMark);

    this.measure(name, startMark, endMark);
    return result;
  }

  getProfile(name: string): Profile | undefined {
    return this.profiles.get(name);
  }

  getAllProfiles(): Profile[] {
    return Array.from(this.profiles.values());
  }

  getStats(): {
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    totalDuration: number;
    count: number;
  } {
    const profiles = Array.from(this.profiles.values());
    if (profiles.length === 0) {
      return { averageDuration: 0, minDuration: 0, maxDuration: 0, totalDuration: 0, count: 0 };
    }

    const durations = profiles.map(p => p.duration);
    return {
      count: durations.length,
      totalDuration: durations.reduce((a, b) => a + b, 0),
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  }

  clear(): void {
    this.profiles.clear();
    this.marks.clear();
  }
}

/**
 * Memory profiler for heap analysis
 */
export class MemoryProfiler {
  private snapshots: Array<{ timestamp: number; heapUsed: number; heapTotal: number }> = [];

  snapshot(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      this.snapshots.push({
        timestamp: Date.now(),
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
      });
    }
  }

  getGrowth(): number {
    if (this.snapshots.length < 2) return 0;

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    return last.heapUsed - first.heapUsed;
  }

  getStats(): {
    current: number;
    average: number;
    peak: number;
    snapshotCount: number;
  } {
    if (this.snapshots.length === 0) {
      return { current: 0, average: 0, peak: 0, snapshotCount: 0 };
    }

    const usages = this.snapshots.map(s => s.heapUsed);
    return {
      current: usages[usages.length - 1],
      average: usages.reduce((a, b) => a + b, 0) / usages.length,
      peak: Math.max(...usages),
      snapshotCount: usages.length,
    };
  }

  clear(): void {
    this.snapshots = [];
  }
}

/**
 * Throughput analyzer
 */
export class ThroughputAnalyzer {
  private events: Array<{ timestamp: number; value: number }> = [];

  record(value: number = 1): void {
    this.events.push({ timestamp: Date.now(), value });
  }

  getThroughput(windowMs: number = 1000): number {
    const now = Date.now();
    const cutoff = now - windowMs;

    const recentEvents = this.events.filter(e => e.timestamp >= cutoff);
    const total = recentEvents.reduce((sum, e) => sum + e.value, 0);

    return windowMs > 0 ? (total / windowMs) * 1000 : 0;
  }

  getAverageThroughput(windowMs: number = 1000): number {
    if (this.events.length < 2) return 0;

    const durations = [];
    for (let i = 1; i < this.events.length; i++) {
      durations.push(this.events[i].timestamp - this.events[i - 1].timestamp);
    }

    const avgInterval = durations.reduce((a, b) => a + b, 0) / durations.length;
    return avgInterval > 0 ? (1000 / avgInterval) * 1 : 0;
  }

  clear(): void {
    this.events = [];
  }
}

/**
 * Performance budget enforcer
 */
export interface PerformanceBudget {
  name: string;
  maxDurationMs: number;
  maxMemoryMb: number;
  maxThroughput?: number;
}

export class PerformanceBudgetManager {
  private budgets: Map<string, PerformanceBudget> = new Map();

  addBudget(budget: PerformanceBudget): void {
    this.budgets.set(budget.name, budget);
  }

  checkProfile(name: string, profile: Profile): { passed: boolean; violations: string[] } {
    const budget = this.budgets.get(name);
    if (!budget) {
      return { passed: true, violations: [] };
    }

    const violations: string[] = [];

    if (profile.duration > budget.maxDurationMs) {
      violations.push(`Duration ${profile.duration}ms exceeds budget ${budget.maxDurationMs}ms`);
    }

    if (profile.memory && profile.memory.heapUsed > budget.maxMemoryMb * 1024 * 1024) {
      violations.push(
        `Memory ${(profile.memory.heapUsed / 1024 / 1024).toFixed(2)}MB exceeds budget ${budget.maxMemoryMb}MB`
      );
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  getBudget(name: string): PerformanceBudget | undefined {
    return this.budgets.get(name);
  }

  getAll(): PerformanceBudget[] {
    return Array.from(this.budgets.values());
  }
}

// Global instances
const globalProfiler = new PerformanceProfiler();
const globalMemoryProfiler = new MemoryProfiler();
const globalThroughput = new ThroughputAnalyzer();
const globalBudgetManager = new PerformanceBudgetManager();

export function createProfiler(): PerformanceProfiler {
  return new PerformanceProfiler();
}

export function createMemoryProfiler(): MemoryProfiler {
  return new MemoryProfiler();
}

export function createThroughputAnalyzer(): ThroughputAnalyzer {
  return new ThroughputAnalyzer();
}

export function createPerformanceBudgetManager(): PerformanceBudgetManager {
  return new PerformanceBudgetManager();
}

export {
  globalProfiler,
  globalMemoryProfiler,
  globalThroughput,
  globalBudgetManager,
};
