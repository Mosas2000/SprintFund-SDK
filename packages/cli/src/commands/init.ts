import { Command } from 'commander';
import { prompt } from 'enquirer';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger';
import { ProjectScaffold } from '../templates/project-scaffold';

interface InitOptions {
  name?: string;
  template?: string;
  packageManager?: string;
  skipInstall?: boolean;
}

interface InitPromptAnswers {
  projectName: string;
  template: string;
  packageManager: string;
  features: string[];
}

export function initCommand(): Command {
  const cmd = new Command('init');

  cmd
    .description('Initialize a new SF Protocol project')
    .option('-n, --name <name>', 'Project name')
    .option('-t, --template <template>', 'Project template (next, vite, node)')
    .option('-pm, --package-manager <manager>', 'Package manager (npm, yarn, pnpm)')
    .option('--skip-install', 'Skip dependency installation')
    .action(async (options: InitOptions) => {
      logger.header('SF Protocol Project Initialization');

      try {
        const answers = await promptUser(options);
        const projectPath = path.resolve(process.cwd(), answers.projectName);

        // Check if directory exists
        if (await fs.pathExists(projectPath)) {
          logger.error(`Directory "${answers.projectName}" already exists`);
          process.exit(1);
        }

        // Create project
        logger.startSpinner('Creating project structure...');
        await createProject(projectPath, answers);
        logger.succeedSpinner('Project structure created');

        // Install dependencies
        if (!options.skipInstall) {
          logger.startSpinner('Installing dependencies...');
          await installDependencies(projectPath, answers.packageManager);
          logger.succeedSpinner('Dependencies installed');
        }

        // Show success message
        displaySuccessMessage(answers.projectName, answers.packageManager);

      } catch (error) {
        logger.failSpinner();
        logger.error('Failed to initialize project');
        if (error instanceof Error) {
          logger.error(error.message);
        }
        process.exit(1);
      }
    });

  return cmd;
}

async function promptUser(options: InitOptions): Promise<InitPromptAnswers> {
  const questions: any[] = [];

  if (!options.name) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-sf-protocol-app',
      validate: (input: string) => {
        if (!input) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name must be lowercase alphanumeric with hyphens';
        }
        return true;
      }
    });
  }

  if (!options.template) {
    questions.push({
      type: 'select',
      name: 'template',
      message: 'Select project template:',
      choices: [
        { name: 'next', message: 'Next.js (Recommended for web apps)' },
        { name: 'vite', message: 'Vite + React (Lightweight SPA)' },
        { name: 'node', message: 'Node.js (Backend/Scripts)' }
      ]
    });
  }

  if (!options.packageManager) {
    questions.push({
      type: 'select',
      name: 'packageManager',
      message: 'Package manager:',
      choices: ['npm', 'yarn', 'pnpm'],
      initial: 0
    });
  }

  questions.push({
    type: 'multiselect',
    name: 'features',
    message: 'Select features to include:',
    choices: [
      { name: 'wallet', message: 'Wallet integration (Hiro, Leather)', enabled: true },
      { name: 'analytics', message: 'Analytics dashboard components', enabled: false },
      { name: 'testing', message: 'Testing setup with Vitest', enabled: true },
      { name: 'eslint', message: 'ESLint configuration', enabled: true },
      { name: 'prettier', message: 'Prettier configuration', enabled: true }
    ]
  });

  const answers = await prompt<InitPromptAnswers>(questions);

  return {
    projectName: options.name || answers.projectName,
    template: options.template || answers.template,
    packageManager: options.packageManager || answers.packageManager,
    features: answers.features
  };
}

async function createProject(
  projectPath: string,
  answers: InitPromptAnswers
): Promise<void> {
  const scaffold = new ProjectScaffold(projectPath, answers);
  await scaffold.create();
}

async function installDependencies(
  projectPath: string,
  packageManager: string
): Promise<void> {
  const installCmd = packageManager === 'yarn' ? 'yarn' : `${packageManager} install`;
  
  await execa(installCmd, {
    cwd: projectPath,
    shell: true,
    stdio: 'pipe'
  });
}

function displaySuccessMessage(projectName: string, packageManager: string): void {
  logger.blank();
  logger.success('Project initialized successfully!');
  logger.blank();
  
  logger.box('Next Steps', [
    `cd ${projectName}`,
    packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`,
    '',
    'Visit http://localhost:3000 to see your app'
  ]);

  logger.section('Useful Commands:');
  logger.listItem(`${packageManager} run dev - Start development server`);
  logger.listItem(`${packageManager} run build - Build for production`);
  logger.listItem(`${packageManager} test - Run tests`);
  logger.blank();

  logger.info('Documentation: https://sf-protocol.github.io/sdk');
  logger.info('Examples: https://github.com/sf-protocol/examples');
  logger.blank();
}
