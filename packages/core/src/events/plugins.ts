/**
 * Plugin system for SDK extensibility
 */

import { EventBus, getEventBus } from './bus.js';

export interface PluginContext {
  eventBus: EventBus;
  config: Record<string, any>;
  logger: { info: (msg: string) => void; error: (msg: string) => void };
}

export interface Plugin {
  name: string;
  version: string;
  initialize(context: PluginContext): Promise<void> | void;
  destroy?(): Promise<void> | void;
}

export interface PluginManagerOptions {
  autoInitialize?: boolean;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private initialized = new Set<string>();
  private context: PluginContext;

  constructor(options: PluginManagerOptions = {}) {
    this.context = {
      eventBus: getEventBus(),
      config: {},
      logger: {
        info: (msg: string) => console.log(`[Plugin] ${msg}`),
        error: (msg: string) => console.error(`[Plugin] ${msg}`),
      },
    };
  }

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }
    this.plugins.set(plugin.name, plugin);
    this.context.logger.info(`Registered plugin: ${plugin.name}@${plugin.version}`);
  }

  async initialize(pluginName?: string): Promise<void> {
    const pluginsToInit = pluginName
      ? [this.plugins.get(pluginName)].filter(Boolean)
      : Array.from(this.plugins.values());

    for (const plugin of pluginsToInit) {
      if (!plugin || this.initialized.has(plugin.name)) continue;

      try {
        await plugin.initialize(this.context);
        this.initialized.add(plugin.name);
        this.context.logger.info(`Initialized plugin: ${plugin.name}`);
      } catch (error) {
        this.context.logger.error(`Failed to initialize ${plugin.name}: ${error}`);
        throw error;
      }
    }
  }

  async destroy(pluginName?: string): Promise<void> {
    const pluginsToDestroy = pluginName
      ? [this.plugins.get(pluginName)].filter(Boolean)
      : Array.from(this.plugins.values()).reverse();

    for (const plugin of pluginsToDestroy) {
      if (!plugin || !this.initialized.has(plugin.name)) continue;

      try {
        await plugin.destroy?.();
        this.initialized.delete(plugin.name);
        this.context.logger.info(`Destroyed plugin: ${plugin.name}`);
      } catch (error) {
        this.context.logger.error(`Failed to destroy ${plugin.name}: ${error}`);
      }
    }
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  list(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  isInitialized(name: string): boolean {
    return this.initialized.has(name);
  }

  setConfig(config: Record<string, any>): void {
    this.context.config = { ...this.context.config, ...config };
  }
}

// Built-in plugins
export const LoggingPlugin: Plugin = {
  name: 'logging',
  version: '1.0.0',
  initialize(context) {
    context.eventBus.on('*', (payload) => {
      context.logger.info(`Event: ${JSON.stringify(payload)}`);
    });
  },
};

export const MetricsPlugin: Plugin = {
  name: 'metrics',
  version: '1.0.0',
  initialize(context) {
    const counts = new Map<string, number>();
    context.eventBus.on('*', (payload: any) => {
      const event = payload?.event ?? 'unknown';
      counts.set(event, (counts.get(event) ?? 0) + 1);
    });
  },
};

const globalPluginManager = new PluginManager();

export function getPluginManager(): PluginManager { return globalPluginManager; }
export function createPluginManager(options?: PluginManagerOptions): PluginManager {
  return new PluginManager(options);
}
export { globalPluginManager };
