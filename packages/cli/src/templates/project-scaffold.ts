import fs from 'fs-extra';
import path from 'path';
import dedent from 'dedent';

interface ScaffoldConfig {
  projectName: string;
  template: string;
  packageManager: string;
  features: string[];
}

export class ProjectScaffold {
  constructor(
    private projectPath: string,
    private config: ScaffoldConfig
  ) {}

  async create(): Promise<void> {
    await this.createDirectoryStructure();
    await this.createPackageJson();
    await this.createConfigFiles();
    await this.createSourceFiles();
    await this.createReadme();
  }

  private async createDirectoryStructure(): Promise<void> {
    const dirs = [
      'src',
      'src/components',
      'src/lib',
      'src/hooks',
      'public'
    ];

    if (this.config.features.includes('testing')) {
      dirs.push('tests');
    }

    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.projectPath, dir));
    }
  }

  private async createPackageJson(): Promise<void> {
    const packageJson = {
      name: this.config.projectName,
      version: '0.1.0',
      private: true,
      scripts: this.getScripts(),
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies()
    };

    await fs.writeJson(
      path.join(this.projectPath, 'package.json'),
      packageJson,
      { spaces: 2 }
    );
  }

  private getScripts(): Record<string, string> {
    const scripts: Record<string, string> = {};

    switch (this.config.template) {
      case 'next':
        scripts.dev = 'next dev';
        scripts.build = 'next build';
        scripts.start = 'next start';
        break;
      case 'vite':
        scripts.dev = 'vite';
        scripts.build = 'vite build';
        scripts.preview = 'vite preview';
        break;
      case 'node':
        scripts.dev = 'tsx watch src/index.ts';
        scripts.build = 'tsc';
        scripts.start = 'node dist/index.js';
        break;
    }

    if (this.config.features.includes('testing')) {
      scripts.test = 'vitest';
      scripts['test:coverage'] = 'vitest --coverage';
    }

    if (this.config.features.includes('eslint')) {
      scripts.lint = 'eslint src --ext .ts,.tsx';
    }

    return scripts;
  }

  private getDependencies(): Record<string, string> {
    const deps: Record<string, string> = {
      '@sf-protocol/core': '^0.2.0'
    };

    if (this.config.template !== 'node') {
      deps['@sf-protocol/react'] = '^0.2.0';
      deps['react'] = '^18.2.0';
      deps['react-dom'] = '^18.2.0';
      deps['@tanstack/react-query'] = '^5.28.0';
    }

    if (this.config.features.includes('wallet')) {
      deps['@stacks/connect'] = '^7.0.0';
    }

    if (this.config.template === 'next') {
      deps['next'] = '^14.0.0';
    }

    return deps;
  }

  private getDevDependencies(): Record<string, string> {
    const devDeps: Record<string, string> = {
      'typescript': '^5.3.3',
      '@types/node': '^20.11.0'
    };

    if (this.config.template !== 'node') {
      devDeps['@types/react'] = '^18.2.0';
      devDeps['@types/react-dom'] = '^18.2.0';
    }

    if (this.config.template === 'vite') {
      devDeps['vite'] = '^5.0.0';
      devDeps['@vitejs/plugin-react'] = '^4.2.0';
    }

    if (this.config.template === 'node') {
      devDeps['tsx'] = '^4.7.0';
    }

    if (this.config.features.includes('testing')) {
      devDeps['vitest'] = '^1.0.0';
      devDeps['@sf-protocol/testing'] = '^0.1.0';
    }

    if (this.config.features.includes('eslint')) {
      devDeps['eslint'] = '^8.56.0';
      devDeps['@typescript-eslint/parser'] = '^6.19.0';
      devDeps['@typescript-eslint/eslint-plugin'] = '^6.19.0';
    }

    if (this.config.features.includes('prettier')) {
      devDeps['prettier'] = '^3.2.0';
    }

    return devDeps;
  }

  private async createConfigFiles(): Promise<void> {
    // TypeScript config
    await this.createTsConfig();

    // ESLint config
    if (this.config.features.includes('eslint')) {
      await this.createEslintConfig();
    }

    // Prettier config
    if (this.config.features.includes('prettier')) {
      await this.createPrettierConfig();
    }

    // Template-specific configs
    if (this.config.template === 'vite') {
      await this.createViteConfig();
    } else if (this.config.template === 'next') {
      await this.createNextConfig();
    }

    // Testing config
    if (this.config.features.includes('testing')) {
      await this.createVitestConfig();
    }
  }

  private async createTsConfig(): Promise<void> {
    const config = {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        allowJs: true,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        jsx: this.config.template === 'node' ? undefined : 'preserve'
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };

    await fs.writeJson(
      path.join(this.projectPath, 'tsconfig.json'),
      config,
      { spaces: 2 }
    );
  }

  private async createEslintConfig(): Promise<void> {
    const config = {
      parser: '@typescript-eslint/parser',
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    };

    await fs.writeJson(
      path.join(this.projectPath, '.eslintrc.json'),
      config,
      { spaces: 2 }
    );
  }

  private async createPrettierConfig(): Promise<void> {
    const config = {
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 80,
      tabWidth: 2
    };

    await fs.writeJson(
      path.join(this.projectPath, '.prettierrc.json'),
      config,
      { spaces: 2 }
    );
  }

  private async createViteConfig(): Promise<void> {
    const config = dedent`
      import { defineConfig } from 'vite';
      import react from '@vitejs/plugin-react';

      export default defineConfig({
        plugins: [react()],
        server: {
          port: 3000
        }
      });
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'vite.config.ts'),
      config
    );
  }

  private async createNextConfig(): Promise<void> {
    const config = dedent`
      /** @type {import('next').NextConfig} */
      const nextConfig = {
        reactStrictMode: true,
      };

      module.exports = nextConfig;
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'next.config.js'),
      config
    );
  }

  private async createVitestConfig(): Promise<void> {
    const config = dedent`
      import { defineConfig } from 'vitest/config';

      export default defineConfig({
        test: {
          environment: 'jsdom',
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html']
          }
        }
      });
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'vitest.config.ts'),
      config
    );
  }

  private async createSourceFiles(): Promise<void> {
    if (this.config.template === 'next') {
      await this.createNextApp();
    } else if (this.config.template === 'vite') {
      await this.createViteApp();
    } else {
      await this.createNodeApp();
    }
  }

  private async createNextApp(): Promise<void> {
    // Create app directory structure
    await fs.ensureDir(path.join(this.projectPath, 'app'));

    // Create layout
    const layout = dedent`
      import { SprintFundProvider } from '@sf-protocol/react';
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

      const queryClient = new QueryClient();

      export default function RootLayout({
        children,
      }: {
        children: React.ReactNode;
      }) {
        return (
          <html lang="en">
            <body>
              <QueryClientProvider client={queryClient}>
                <SprintFundProvider network="mainnet">
                  {children}
                </SprintFundProvider>
              </QueryClientProvider>
            </body>
          </html>
        );
      }
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'app/layout.tsx'),
      layout
    );

    // Create page
    const page = dedent`
      'use client';

      import { useProposals } from '@sf-protocol/react';

      export default function Home() {
        const { data: proposals, isLoading } = useProposals();

        return (
          <main>
            <h1>SF Protocol Proposals</h1>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div>
                {proposals?.map((proposal) => (
                  <div key={proposal.id}>
                    <h2>{proposal.title}</h2>
                    <p>{proposal.description}</p>
                  </div>
                ))}
              </div>
            )}
          </main>
        );
      }
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'app/page.tsx'),
      page
    );
  }

  private async createViteApp(): Promise<void> {
    // Create main entry
    const main = dedent`
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import App from './App';

      ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'src/main.tsx'),
      main
    );

    // Create App component
    const app = dedent`
      import { SprintFundProvider } from '@sf-protocol/react';
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
      import { useProposals } from '@sf-protocol/react';

      const queryClient = new QueryClient();

      function ProposalList() {
        const { data: proposals, isLoading } = useProposals();

        if (isLoading) return <p>Loading...</p>;

        return (
          <div>
            {proposals?.map((proposal) => (
              <div key={proposal.id}>
                <h2>{proposal.title}</h2>
                <p>{proposal.description}</p>
              </div>
            ))}
          </div>
        );
      }

      export default function App() {
        return (
          <QueryClientProvider client={queryClient}>
            <SprintFundProvider network="mainnet">
              <h1>SF Protocol Proposals</h1>
              <ProposalList />
            </SprintFundProvider>
          </QueryClientProvider>
        );
      }
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'src/App.tsx'),
      app
    );

    // Create index.html
    const html = dedent`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${this.config.projectName}</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
      </html>
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'index.html'),
      html
    );
  }

  private async createNodeApp(): Promise<void> {
    const index = dedent`
      import { createClient } from '@sf-protocol/core';

      async function main() {
        const client = createClient({ network: 'mainnet' });

        // Fetch proposals
        const proposals = await client.proposals.listProposals();
        console.log('Proposals:', proposals);

        // Get stake balance
        const address = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
        const balance = await client.stakes.getStakeBalance(address);
        console.log('Stake balance:', balance);
      }

      main().catch(console.error);
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'src/index.ts'),
      index
    );
  }

  private async createReadme(): Promise<void> {
    const readme = dedent`
      # ${this.config.projectName}

      A SF Protocol application built with ${this.config.template}.

      ## Getting Started

      First, install dependencies:

      \`\`\`bash
      ${this.config.packageManager === 'npm' ? 'npm install' : `${this.config.packageManager} install`}
      \`\`\`

      Then, run the development server:

      \`\`\`bash
      ${this.config.packageManager === 'npm' ? 'npm run dev' : `${this.config.packageManager} dev`}
      \`\`\`

      ## Features

      ${this.config.features.map(f => `- ${f}`).join('\n')}

      ## Learn More

      - [SF Protocol Documentation](https://sf-protocol.github.io/sdk)
      - [SF Protocol GitHub](https://github.com/sf-protocol/sdk)

      ## License

      MIT
    `;

    await fs.writeFile(
      path.join(this.projectPath, 'README.md'),
      readme
    );
  }
}
