/**
 * Configuration management system with environment support
 */

export type ConfigValue = string | number | boolean | null | Record<string, any>;

export interface ConfigEnvironment {
  name: string;
  vars: Record<string, ConfigValue>;
}

/**
 * Configuration manager with hierarchical fallback
 */
export class ConfigManager {
  private configs: Map<string, ConfigEnvironment> = new Map();
  private currentEnv: string = 'default';
  private overrides: Map<string, ConfigValue> = new Map();

  addEnvironment(name: string, vars: Record<string, ConfigValue>): void {
    this.configs.set(name, { name, vars });
  }

  setEnvironment(name: string): void {
    if (!this.configs.has(name)) {
      throw new Error(`Environment ${name} not configured`);
    }
    this.currentEnv = name;
  }

  getEnvironment(): string {
    return this.currentEnv;
  }

  set(key: string, value: ConfigValue): void {
    this.overrides.set(key, value);
  }

  get<T extends ConfigValue = ConfigValue>(key: string, fallback?: T): T {
    if (this.overrides.has(key)) {
      return this.overrides.get(key) as T;
    }

    const env = this.configs.get(this.currentEnv);
    if (env?.vars[key] !== undefined) {
      return env.vars[key] as T;
    }

    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Configuration key ${key} not found`);
  }

  getAll(): Record<string, ConfigValue> {
    const env = this.configs.get(this.currentEnv);
    return { ...env?.vars, ...Object.fromEntries(this.overrides) };
  }

  has(key: string): boolean {
    if (this.overrides.has(key)) return true;
    const env = this.configs.get(this.currentEnv);
    return env?.vars[key] !== undefined;
  }

  reset(): void {
    this.overrides.clear();
  }
}

/**
 * Environment-based config loader
 */
export class EnvConfigLoader {
  static fromEnvironment(prefix = 'APP_'): Record<string, ConfigValue> {
    const config: Record<string, ConfigValue> = {};

    if (typeof process !== 'undefined' && process.env) {
      const entries = Object.entries(process.env);
      for (const [key, value] of entries) {
        if (key.startsWith(prefix)) {
          const configKey = key.slice(prefix.length).toLowerCase();
          config[configKey] = this.parseValue(value);
        }
      }
    }

    return config;
  }

  static fromObject(obj: Record<string, any>, prefix = ''): Record<string, ConfigValue> {
    const config: Record<string, ConfigValue> = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(config, this.fromObject(value, fullKey));
      } else {
        config[fullKey] = value;
      }
    }

    return config;
  }

  private static parseValue(value: any): ConfigValue {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (!isNaN(Number(value))) return Number(value);
    return String(value);
  }
}

/**
 * Feature flag manager
 */
export class FeatureFlagManager {
  private flags: Map<string, boolean> = new Map();

  enable(flag: string): void {
    this.flags.set(flag, true);
  }

  disable(flag: string): void {
    this.flags.set(flag, false);
  }

  isEnabled(flag: string): boolean {
    return this.flags.get(flag) ?? false;
  }

  setBatch(flags: Record<string, boolean>): void {
    for (const [flag, enabled] of Object.entries(flags)) {
      this.flags.set(flag, enabled);
    }
  }

  getAll(): Record<string, boolean> {
    return Object.fromEntries(this.flags);
  }

  clear(): void {
    this.flags.clear();
  }
}

/**
 * Secrets manager for sensitive data
 */
export class SecretsManager {
  private secrets: Map<string, string> = new Map();

  set(key: string, value: string): void {
    this.secrets.set(key, value);
  }

  get(key: string): string | undefined {
    return this.secrets.get(key);
  }

  getRequired(key: string): string {
    const value = this.secrets.get(key);
    if (!value) {
      throw new Error(`Secret ${key} not found`);
    }
    return value;
  }

  has(key: string): boolean {
    return this.secrets.has(key);
  }

  delete(key: string): void {
    this.secrets.delete(key);
  }

  clear(): void {
    this.secrets.clear();
  }
}

/**
 * Configuration builder for fluent API
 */
export class ConfigBuilder {
  private manager = new ConfigManager();
  private featureFlags = new FeatureFlagManager();
  private secrets = new SecretsManager();

  addEnvironment(name: string, vars: Record<string, ConfigValue>): this {
    this.manager.addEnvironment(name, vars);
    return this;
  }

  addFeatureFlag(flag: string, enabled = true): this {
    if (enabled) {
      this.featureFlags.enable(flag);
    } else {
      this.featureFlags.disable(flag);
    }
    return this;
  }

  addSecret(key: string, value: string): this {
    this.secrets.set(key, value);
    return this;
  }

  setEnvironment(name: string): this {
    this.manager.setEnvironment(name);
    return this;
  }

  build(): {
    config: ConfigManager;
    features: FeatureFlagManager;
    secrets: SecretsManager;
  } {
    return {
      config: this.manager,
      features: this.featureFlags,
      secrets: this.secrets,
    };
  }
}

export function createConfig(): ConfigBuilder {
  return new ConfigBuilder();
}

export {
  ConfigManager,
  EnvConfigLoader,
  FeatureFlagManager,
  SecretsManager,
};
