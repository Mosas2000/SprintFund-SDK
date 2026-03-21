/**
 * Interactive project scaffolding with templates
 */

import { promises as fs } from 'fs';
import * as path from 'path';

export interface ProjectConfig {
  name: string;
  template: 'minimal' | 'standard' | 'advanced' | 'enterprise';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  typescript: boolean;
  features: {
    react?: boolean;
    indexer?: boolean;
    testing?: boolean;
    ci?: boolean;
    docker?: boolean;
  };
}

export interface ScaffoldResult {
  path: string;
  files: string[];
  commands: string[];
}

/**
 * Project scaffolder for SF Protocol apps
 */
export class ProjectScaffolder {
  async scaffold(config: ProjectConfig, targetDir: string): Promise<ScaffoldResult> {
    const projectPath = path.join(targetDir, config.name);
    const files: string[] = [];

    await fs.mkdir(projectPath, { recursive: true });

    const packageJson = this.generatePackageJson(config);
    await this.writeFile(projectPath, 'package.json', JSON.stringify(packageJson, null, 2));
    files.push('package.json');

    if (config.typescript) {
      const tsConfig = this.generateTsConfig(config);
      await this.writeFile(projectPath, 'tsconfig.json', JSON.stringify(tsConfig, null, 2));
      files.push('tsconfig.json');
    }

    const readme = this.generateReadme(config);
    await this.writeFile(projectPath, 'README.md', readme);
    files.push('README.md');

    const gitignore = this.generateGitignore();
    await this.writeFile(projectPath, '.gitignore', gitignore);
    files.push('.gitignore');

    const envFile = this.generateEnvFile(config);
    await this.writeFile(projectPath, '.env.example', envFile);
    files.push('.env.example');

    const sourceFiles = await this.generateSourceFiles(config, projectPath);
    files.push(...sourceFiles);

    if (config.features.ci) {
      const ciConfig = this.generateCIConfig(config);
      await fs.mkdir(path.join(projectPath, '.github', 'workflows'), { recursive: true });
      await this.writeFile(projectPath, '.github/workflows/ci.yml', ciConfig);
      files.push('.github/workflows/ci.yml');
    }

    if (config.features.docker) {
      const dockerfile = this.generateDockerfile(config);
      await this.writeFile(projectPath, 'Dockerfile', dockerfile);
      files.push('Dockerfile');

      const dockerCompose = this.generateDockerCompose(config);
      await this.writeFile(projectPath, 'docker-compose.yml', dockerCompose);
      files.push('docker-compose.yml');
    }

    const commands = this.generateCommands(config);

    return {
      path: projectPath,
      files,
      commands,
    };
  }

  private async writeFile(basePath: string, filePath: string, content: string): Promise<void> {
    const fullPath = path.join(basePath, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  private generatePackageJson(config: ProjectConfig): any {
    return {
      name: config.name,
      version: '0.1.0',
      description: 'SF Protocol application',
      type: 'module',
      scripts: {
        dev: config.features.react ? 'vite' : 'node src/index.js',
        build: config.typescript ? 'tsc' : 'echo "No build step"',
        test: config.features.testing ? 'vitest' : 'echo "No tests"',
        lint: 'eslint .',
      },
      dependencies: {
        '@sf-protocol/core': '^0.2.0',
        ...(config.features.react && { '@sf-protocol/react': '^0.2.0', react: '^18.3.1' }),
        ...(config.features.indexer && { '@sf-protocol/indexer': '^0.2.0' }),
      },
      devDependencies: {
        ...(config.typescript && { typescript: '^5.3.3', '@types/node': '^20.10.0' }),
        ...(config.features.testing && { vitest: '^1.0.0' }),
        eslint: '^8.57.1',
      },
    };
  }

  private generateTsConfig(config: ProjectConfig): any {
    return {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        lib: ['ES2022'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        outDir: './dist',
        rootDir: './src',
        ...(config.features.react && { jsx: 'react-jsx' }),
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };
  }

  private generateReadme(config: ProjectConfig): string {
    return `# ${config.name}

SF Protocol application built with ${config.template} template.

## Getting Started

\`\`\`bash
${config.packageManager} install
${config.packageManager} ${config.packageManager === 'npm' ? 'run ' : ''}dev
\`\`\`
`;
  }

  private generateGitignore(): string {
    return `node_modules/\ndist/\n.env\n.env.local\n*.log\n.DS_Store\ncoverage/\n`;
  }

  private generateEnvFile(config: ProjectConfig): string {
    return `STACKS_NETWORK=mainnet\nCONTRACT_ADDRESS=SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3\n`;
  }

  private async generateSourceFiles(config: ProjectConfig, projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const srcDir = path.join(projectPath, 'src');
    await fs.mkdir(srcDir, { recursive: true });

    if (config.features.react) {
      const appTsx = `import { SprintFundProvider } from '@sf-protocol/react';\n\nfunction App() {\n  return <div><h1>${config.name}</h1></div>;\n}\n\nexport default function Root() {\n  return <SprintFundProvider><App /></SprintFundProvider>;\n}\n`;
      await this.writeFile(projectPath, 'src/App.tsx', appTsx);
      files.push('src/App.tsx');
    } else {
      const indexJs = `import { SprintFundClient } from '@sf-protocol/core';\n\nasync function main() {\n  const client = new SprintFundClient({ network: 'mainnet' });\n  console.log('Client ready');\n}\n\nmain().catch(console.error);\n`;
      await this.writeFile(projectPath, 'src/index.js', indexJs);
      files.push('src/index.js');
    }

    return files;
  }

  private generateCIConfig(config: ProjectConfig): string {
    return `name: CI\n\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n        with:\n          node-version: 20\n      - run: ${config.packageManager} install\n      - run: ${config.packageManager} ${config.packageManager === 'npm' ? 'run ' : ''}build\n`;
  }

  private generateDockerfile(config: ProjectConfig): string {
    return `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN ${config.packageManager} install\nCOPY . .\nRUN ${config.packageManager} ${config.packageManager === 'npm' ? 'run ' : ''}build\nEXPOSE 3000\nCMD ["${config.packageManager}", "run", "dev"]\n`;
  }

  private generateDockerCompose(config: ProjectConfig): string {
    return `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n`;
  }

  private generateCommands(config: ProjectConfig): string[] {
    return [
      `cd ${config.name}`,
      `${config.packageManager} install`,
      `${config.packageManager} ${config.packageManager === 'npm' ? 'run ' : ''}dev`,
    ];
  }
}

export function createScaffolder(): ProjectScaffolder {
  return new ProjectScaffolder();
}
