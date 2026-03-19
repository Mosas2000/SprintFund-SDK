import { Command } from 'commander';
import { prompt } from 'enquirer';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger';
import Handlebars from 'handlebars';
import dedent from 'dedent';

interface GenerateOptions {
  type?: string;
  name?: string;
  output?: string;
}

interface GeneratePromptAnswers {
  type: string;
  name: string;
  output: string;
}

export function generateCommand(): Command {
  const cmd = new Command('generate');

  cmd
    .description('Generate code from templates')
    .alias('g')
    .option('-t, --type <type>', 'Generation type (proposal, vote, stake, hook)')
    .option('-n, --name <name>', 'Component/function name')
    .option('-o, --output <path>', 'Output directory')
    .action(async (options: GenerateOptions) => {
      logger.header('SF Protocol Code Generator');

      try {
        const answers = await promptUser(options);
        
        logger.startSpinner('Generating code...');
        await generateCode(answers);
        logger.succeedSpinner('Code generated successfully');

        displayGeneratedFiles(answers);

      } catch (error) {
        logger.failSpinner();
        logger.error('Failed to generate code');
        if (error instanceof Error) {
          logger.error(error.message);
        }
        process.exit(1);
      }
    });

  return cmd;
}

async function promptUser(options: GenerateOptions): Promise<GeneratePromptAnswers> {
  const questions: any[] = [];

  if (!options.type) {
    questions.push({
      type: 'select',
      name: 'type',
      message: 'What do you want to generate?',
      choices: [
        { name: 'proposal', message: 'Proposal creation logic' },
        { name: 'vote', message: 'Voting logic' },
        { name: 'stake', message: 'Staking logic' },
        { name: 'hook', message: 'Custom React hook' },
        { name: 'component', message: 'React component' }
      ]
    });
  }

  if (!options.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Component/function name:',
      validate: (input: string) => {
        if (!input) return 'Name is required';
        if (!/^[A-Za-z][A-Za-z0-9]*$/.test(input)) {
          return 'Name must be alphanumeric and start with a letter';
        }
        return true;
      }
    });
  }

  if (!options.output) {
    questions.push({
      type: 'input',
      name: 'output',
      message: 'Output directory:',
      initial: './src'
    });
  }

  const answers = await prompt<GeneratePromptAnswers>(questions);

  return {
    type: options.type || answers.type,
    name: options.name || answers.name,
    output: options.output || answers.output
  };
}

async function generateCode(answers: GeneratePromptAnswers): Promise<void> {
  const { type, name, output } = answers;
  const outputPath = path.resolve(process.cwd(), output);

  await fs.ensureDir(outputPath);

  switch (type) {
    case 'proposal':
      await generateProposalLogic(outputPath, name);
      break;
    case 'vote':
      await generateVoteLogic(outputPath, name);
      break;
    case 'stake':
      await generateStakeLogic(outputPath, name);
      break;
    case 'hook':
      await generateReactHook(outputPath, name);
      break;
    case 'component':
      await generateReactComponent(outputPath, name);
      break;
    default:
      throw new Error(`Unknown generation type: ${type}`);
  }
}

async function generateProposalLogic(outputPath: string, name: string): Promise<void> {
  const template = dedent`
    import { SprintFundClient } from '@sf-protocol/core';
    import { BigIntString } from '@sf-protocol/core';

    export interface {{name}}Proposal {
      title: string;
      description: string;
      fundingGoal: BigIntString;
      votingPeriod: number;
    }

    export class {{name}}ProposalService {
      constructor(private client: SprintFundClient) {}

      async createProposal(proposal: {{name}}Proposal) {
        const tx = await this.client.transactions.createProposal({
          title: proposal.title,
          description: proposal.description,
          fundingGoal: proposal.fundingGoal,
          votingPeriod: proposal.votingPeriod
        });

        return tx;
      }

      async getProposal(proposalId: number) {
        return await this.client.proposals.getProposal(proposalId);
      }

      async listProposals() {
        return await this.client.proposals.listProposals();
      }
    }
  `;

  const compiled = Handlebars.compile(template);
  const code = compiled({ name });

  const filename = `${camelToKebab(name)}-proposal.ts`;
  await fs.writeFile(path.join(outputPath, filename), code);
}

async function generateVoteLogic(outputPath: string, name: string): Promise<void> {
  const template = dedent`
    import { SprintFundClient } from '@sf-protocol/core';

    export class {{name}}VotingService {
      constructor(private client: SprintFundClient) {}

      async vote(proposalId: number, weight: number, support: boolean) {
        const cost = await this.client.voting.calculateVoteCost(weight);
        
        const tx = await this.client.transactions.vote({
          proposalId,
          weight,
          support
        });

        return { transaction: tx, cost };
      }

      async getVotingPower(address: string) {
        return await this.client.voting.getVotingPower(address);
      }

      async estimateVoteCost(weight: number) {
        return await this.client.voting.calculateVoteCost(weight);
      }
    }
  `;

  const compiled = Handlebars.compile(template);
  const code = compiled({ name });

  const filename = `${camelToKebab(name)}-voting.ts`;
  await fs.writeFile(path.join(outputPath, filename), code);
}

async function generateStakeLogic(outputPath: string, name: string): Promise<void> {
  const template = dedent`
    import { SprintFundClient, BigIntString } from '@sf-protocol/core';

    export class {{name}}StakingService {
      constructor(private client: SprintFundClient) {}

      async stake(amount: BigIntString) {
        const tx = await this.client.transactions.depositStake(amount);
        return tx;
      }

      async unstake(amount: BigIntString) {
        const tx = await this.client.transactions.withdrawStake(amount);
        return tx;
      }

      async getStakeBalance(address: string) {
        return await this.client.stakes.getStakeBalance(address);
      }

      async getTotalStaked() {
        return await this.client.stakes.getTotalStaked();
      }
    }
  `;

  const compiled = Handlebars.compile(template);
  const code = compiled({ name });

  const filename = `${camelToKebab(name)}-staking.ts`;
  await fs.writeFile(path.join(outputPath, filename), code);
}

async function generateReactHook(outputPath: string, name: string): Promise<void> {
  const template = dedent`
    import { useQuery } from '@tanstack/react-query';
    import { useSprintFundClient } from '@sf-protocol/react';

    export function use{{name}}() {
      const client = useSprintFundClient();

      const query = useQuery({
        queryKey: ['{{kebabName}}'],
        queryFn: async () => {
          // Implement your query logic here
          return null;
        },
        staleTime: 60000 // 1 minute
      });

      return query;
    }
  `;

  const compiled = Handlebars.compile(template);
  const code = compiled({ 
    name,
    kebabName: camelToKebab(name)
  });

  const filename = `use${name}.ts`;
  await fs.writeFile(path.join(outputPath, filename), code);
}

async function generateReactComponent(outputPath: string, name: string): Promise<void> {
  const template = dedent`
    import React from 'react';

    export interface {{name}}Props {
      // Add your props here
    }

    export function {{name}}({ }: {{name}}Props) {
      return (
        <div>
          <h2>{{name}}</h2>
          {/* Add your component logic here */}
        </div>
      );
    }
  `;

  const compiled = Handlebars.compile(template);
  const code = compiled({ name });

  const filename = `${name}.tsx`;
  await fs.writeFile(path.join(outputPath, filename), code);
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function displayGeneratedFiles(answers: GeneratePromptAnswers): void {
  logger.blank();
  logger.success('Generated files:');
  logger.blank();

  const { type, name, output } = answers;
  let filename = '';

  switch (type) {
    case 'proposal':
      filename = `${camelToKebab(name)}-proposal.ts`;
      break;
    case 'vote':
      filename = `${camelToKebab(name)}-voting.ts`;
      break;
    case 'stake':
      filename = `${camelToKebab(name)}-staking.ts`;
      break;
    case 'hook':
      filename = `use${name}.ts`;
      break;
    case 'component':
      filename = `${name}.tsx`;
      break;
  }

  logger.listItem(`${output}/${filename}`);
  logger.blank();
  logger.info('Import this into your application and customize as needed.');
}
