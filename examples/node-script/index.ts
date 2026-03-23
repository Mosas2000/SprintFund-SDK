/**
 * SF Protocol Node.js Example
 * Demonstrates core SDK usage for server-side applications
 */

import { SprintFundClient } from '@sf-protocol/core';
import {
  RetryHandler,
  CircuitBreaker,
  StructuredLogger,
  LogLevel,
  MetricsCollector,
  ConfigManager,
} from '@sf-protocol/core';

// Configuration
const config = new ConfigManager();
config.addEnvironment('mainnet', {
  network: 'mainnet',
  contractAddress: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3',
});
config.setEnvironment('mainnet');

// Logging
const logger = new StructuredLogger(LogLevel.INFO);
logger.setContext({ service: 'sf-protocol-example' });

// Metrics
const metrics = new MetricsCollector();

// Resilience
const retry = new RetryHandler({ maxAttempts: 3, initialDelayMs: 100 });
const breaker = new CircuitBreaker(5, 2, 30000);

// Client
const client = new SprintFundClient({
  network: config.get('network'),
});

async function listProposals() {
  logger.info('Fetching proposals');
  const startTime = Date.now();

  try {
    const proposals = await retry.execute(async () => {
      return await breaker.execute(() => client.proposals.list());
    });

    metrics.record('proposals.fetch.duration', Date.now() - startTime, 'ms');
    metrics.counter('proposals.fetch.success');

    logger.info('Proposals fetched', { count: proposals.length });
    return proposals;
  } catch (error) {
    metrics.counter('proposals.fetch.error');
    logger.error('Failed to fetch proposals', error as Error);
    throw error;
  }
}

async function getProposalDetails(id: number) {
  logger.info('Fetching proposal details', { proposalId: id });

  const proposal = await client.proposals.get(id);
  
  if (!proposal) {
    logger.warn('Proposal not found', { proposalId: id });
    return null;
  }

  logger.info('Proposal details', {
    id: proposal.id,
    title: proposal.title,
    status: proposal.status,
  });

  return proposal;
}

async function checkStakeBalance(address: string) {
  logger.info('Checking stake balance', { address });

  const balance = await client.stakes.get(address);
  
  logger.info('Stake balance', {
    address,
    balance: balance.toString(),
  });

  return balance;
}

async function main() {
  logger.info('Starting SF Protocol example');

  try {
    // List proposals
    const proposals = await listProposals();
    console.log(`\nFound ${proposals.length} proposals\n`);

    // Get first proposal details
    if (proposals.length > 0) {
      const details = await getProposalDetails(proposals[0].id);
      console.log('First proposal:', details);
    }

    // Check stake balance
    const testAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
    const balance = await checkStakeBalance(testAddress);
    console.log(`\nStake balance for ${testAddress}: ${balance}`);

    // Print metrics
    console.log('\n--- Metrics ---');
    const stats = metrics.getStats('proposals.fetch.duration');
    if (stats) {
      console.log(`Fetch duration: avg=${stats.avg}ms, min=${stats.min}ms, max=${stats.max}ms`);
    }

  } catch (error) {
    logger.error('Example failed', error as Error);
    process.exit(1);
  }

  logger.info('Example completed');
}

main();
