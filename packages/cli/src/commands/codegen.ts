import { Command } from 'commander';
import { prompt } from 'enquirer';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger';
import { parseABI, ClarityABI } from '../../../core/src/codegen/abi-parser';
import { generateTypes } from '../../../core/src/codegen/type-generator';
import { generateClient } from '../../../core/src/codegen/client-generator';

interface CodegenOptions {
  abi?: string;
  output?: string;
  contract?: string;
  types?: boolean;
  client?: boolean;
}

interface CodegenPromptAnswers {
  abiPath: string;
  outputDir: string;
  contractAddress: string;
  generateTypes: boolean;
  generateClient: boolean;
}

export function codegenCommand(): Command {
  const cmd = new Command('codegen');

  cmd
    .description('Generate TypeScript code from contract ABI')
    .option('-a, --abi <path>', 'Path to contract ABI JSON file')
    .option('-o, --output <path>', 'Output directory for generated code')
    .option('-c, --contract <address>', 'Contract address (principal)')
    .option('--types', 'Generate only type definitions')
    .option('--client', 'Generate only client code')
    .action(async (options: CodegenOptions) => {
      logger.header('SF Protocol Code Generator');

      try {
        const answers = await promptUser(options);

        // Load ABI
        logger.startSpinner('Loading contract ABI...');
        const abi = await loadABI(answers.abiPath);
        logger.succeedSpinner('ABI loaded successfully');

        // Extract contract name from path
        const contractName = path.basename(answers.abiPath, '.json');

        // Parse ABI
        logger.startSpinner('Parsing contract ABI...');
        const parsedContract = parseABI(abi, contractName);
        logger.succeedSpinner(`Parsed ${parsedContract.readOnlyFunctions.length} read-only and ${parsedContract.publicFunctions.length} public functions`);

        // Generate code
        const outputPath = path.resolve(process.cwd(), answers.outputDir);
        await fs.ensureDir(outputPath);

        const generatedFiles: string[] = [];

        if (answers.generateTypes) {
          logger.startSpinner('Generating TypeScript types...');
          const types = generateTypes(parsedContract);
          const typesFile = path.join(outputPath, `${toKebabCase(contractName)}.types.ts`);
          await fs.writeFile(typesFile, types);
          generatedFiles.push(typesFile);
          logger.succeedSpinner('Types generated');
        }

        if (answers.generateClient) {
          logger.startSpinner('Generating client code...');
          const client = generateClient(parsedContract, answers.contractAddress);
          const clientFile = path.join(outputPath, `${toKebabCase(contractName)}.client.ts`);
          await fs.writeFile(clientFile, client);
          generatedFiles.push(clientFile);
          logger.succeedSpinner('Client generated');
        }

        // Success message
        displaySuccessMessage(generatedFiles);

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

async function promptUser(options: CodegenOptions): Promise<CodegenPromptAnswers> {
  const questions: any[] = [];

  if (!options.abi) {
    questions.push({
      type: 'input',
      name: 'abiPath',
      message: 'Path to contract ABI JSON file:',
      validate: async (input: string) => {
        if (!input) return 'ABI path is required';
        const exists = await fs.pathExists(input);
        if (!exists) return 'ABI file not found';
        return true;
      }
    });
  }

  if (!options.output) {
    questions.push({
      type: 'input',
      name: 'outputDir',
      message: 'Output directory:',
      initial: './src/generated'
    });
  }

  if (!options.contract) {
    questions.push({
      type: 'input',
      name: 'contractAddress',
      message: 'Contract address (principal):',
      initial: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3',
      validate: (input: string) => {
        if (!input) return 'Contract address is required';
        if (!input.includes('.')) return 'Contract address must be in format: PRINCIPAL.CONTRACT-NAME';
        return true;
      }
    });
  }

  // Determine what to generate
  const generateBoth = !options.types && !options.client;

  if (generateBoth) {
    questions.push({
      type: 'multiselect',
      name: 'generateWhat',
      message: 'What to generate:',
      choices: [
        { name: 'types', message: 'TypeScript type definitions', enabled: true },
        { name: 'client', message: 'Client code with methods', enabled: true }
      ],
      validate: (value: string[]) => {
        return value.length > 0 || 'Select at least one option';
      }
    });
  }

  const answers = await prompt<any>(questions);

  return {
    abiPath: options.abi || answers.abiPath,
    outputDir: options.output || answers.outputDir,
    contractAddress: options.contract || answers.contractAddress,
    generateTypes: options.types || generateBoth || (answers.generateWhat && answers.generateWhat.includes('types')),
    generateClient: options.client || generateBoth || (answers.generateWhat && answers.generateWhat.includes('client'))
  };
}

async function loadABI(abiPath: string): Promise<ClarityABI> {
  try {
    const content = await fs.readFile(abiPath, 'utf-8');
    const abi = JSON.parse(content);

    // Validate ABI structure
    if (!abi.functions || !Array.isArray(abi.functions)) {
      throw new Error('Invalid ABI: missing or invalid functions array');
    }

    return abi as ClarityABI;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in ABI file');
    }
    throw error;
  }
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function displaySuccessMessage(files: string[]): void {
  logger.blank();
  logger.success('Code generation complete!');
  logger.blank();

  logger.section('Generated files:');
  files.forEach(file => {
    logger.listItem(path.relative(process.cwd(), file));
  });
  logger.blank();

  logger.info('Import these files into your application.');
  logger.info('For type safety, ensure TypeScript strict mode is enabled.');
  logger.blank();

  logger.box('Next Steps', [
    'Import the generated client in your code',
    'Configure network settings',
    'Start making contract calls',
    '',
    'Example:',
    "import { createMyContractClient } from './generated/my-contract.client';",
    "const client = createMyContractClient({ network: 'mainnet' });"
  ]);
}
