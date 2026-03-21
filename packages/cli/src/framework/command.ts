/**
 * CLI command framework and orchestration
 */

export interface CommandContext {
  cwd: string;
  args: Record<string, any>;
  flags: Record<string, boolean>;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: Error;
}

export abstract class Command {
  abstract name: string;
  abstract description: string;
  abstract aliases?: string[];

  abstract execute(context: CommandContext): Promise<CommandResult>;

  protected success(message?: string, data?: any): CommandResult {
    return { success: true, message, data };
  }

  protected error(message: string, error?: Error): CommandResult {
    return { success: false, message, error };
  }
}

export class CommandRegistry {
  private commands = new Map<string, Command>();

  register(command: Command): void {
    this.commands.set(command.name, command);
    command.aliases?.forEach(alias => {
      this.commands.set(alias, command);
    });
  }

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  list(): Command[] {
    const seen = new Set<Command>();
    return Array.from(this.commands.values()).filter(cmd => {
      if (seen.has(cmd)) return false;
      seen.add(cmd);
      return true;
    });
  }

  async execute(name: string, context: CommandContext): Promise<CommandResult> {
    const command = this.get(name);
    if (!command) {
      return { success: false, message: `Command '${name}' not found` };
    }

    try {
      return await command.execute(context);
    } catch (error) {
      return {
        success: false,
        message: 'Command execution failed',
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export class ArgumentParser {
  parse(args: string[]): { command?: string; args: Record<string, any>; flags: Record<string, boolean> } {
    const parsed: any = { args: {}, flags: {} };
    let command: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith('-')) {
          parsed.args[key] = nextArg;
          i++;
        } else {
          parsed.flags[key] = true;
        }
      } else if (arg.startsWith('-')) {
        parsed.flags[arg.slice(1)] = true;
      } else if (!command) {
        command = arg;
      } else {
        if (!parsed.args._) parsed.args._ = [];
        parsed.args._.push(arg);
      }
    }

    return { command, ...parsed };
  }
}

export class OutputFormatter {
  format(result: CommandResult, format: 'text' | 'json' = 'text'): string {
    if (format === 'json') {
      return JSON.stringify({
        success: result.success,
        message: result.message,
        data: result.data,
        error: result.error?.message,
      }, null, 2);
    }

    if (result.success) {
      let output = result.message ? `✓ ${result.message}` : '✓ Success';
      if (result.data) {
        output += '\n' + this.formatData(result.data);
      }
      return output;
    } else {
      let output = result.message ? `✗ ${result.message}` : '✗ Error';
      if (result.error) {
        output += `\n  ${result.error.message}`;
      }
      return output;
    }
  }

  private formatData(data: any): string {
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `  ${key}: ${value}`)
        .join('\n');
    }
    return String(data);
  }
}

const globalRegistry = new CommandRegistry();

export function getGlobalRegistry(): CommandRegistry {
  return globalRegistry;
}

export function createRegistry(): CommandRegistry {
  return new CommandRegistry();
}

export function createParser(): ArgumentParser {
  return new ArgumentParser();
}

export function createFormatter(): OutputFormatter {
  return new OutputFormatter();
}
