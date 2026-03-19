import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private spinner: Ora | null = null;

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✔'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🔍'), chalk.gray(message));
    }
  }

  startSpinner(message: string): void {
    this.spinner = ora(message).start();
  }

  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  succeedSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    }
  }

  failSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    }
  }

  stopSpinner(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  blank(): void {
    console.log();
  }

  header(message: string): void {
    console.log();
    console.log(chalk.bold.cyan(message));
    console.log(chalk.cyan('═'.repeat(message.length)));
    console.log();
  }

  section(message: string): void {
    console.log();
    console.log(chalk.bold(message));
  }

  listItem(message: string, indent: number = 0): void {
    const prefix = '  '.repeat(indent) + '• ';
    console.log(chalk.gray(prefix) + message);
  }

  code(message: string): void {
    console.log(chalk.bgGray.white(` ${message} `));
  }

  box(title: string, content: string[]): void {
    const maxLength = Math.max(title.length, ...content.map(l => l.length));
    const border = '─'.repeat(maxLength + 4);
    
    console.log();
    console.log(chalk.cyan('┌' + border + '┐'));
    console.log(chalk.cyan('│') + '  ' + chalk.bold(title.padEnd(maxLength)) + '  ' + chalk.cyan('│'));
    console.log(chalk.cyan('├' + border + '┤'));
    
    content.forEach(line => {
      console.log(chalk.cyan('│') + '  ' + line.padEnd(maxLength) + '  ' + chalk.cyan('│'));
    });
    
    console.log(chalk.cyan('└' + border + '┘'));
    console.log();
  }
}

export const logger = new Logger();
