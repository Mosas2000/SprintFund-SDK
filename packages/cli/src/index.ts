import { Command } from 'commander';
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';
import { codegenCommand } from './commands/codegen';

const version = '0.1.0';

const program = new Command();

program
  .name('sf-protocol')
  .description('CLI tool for SF Protocol SDK development')
  .version(version, '-v, --version', 'Display CLI version');

// Register commands
program.addCommand(initCommand());
program.addCommand(generateCommand());
program.addCommand(codegenCommand());

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

export { program };
