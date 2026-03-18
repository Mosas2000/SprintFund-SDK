import { SprintFundClient, createClient } from '../src/client/sprintfund.js';
import { toBigIntString, toPrincipal } from '../src/types/index.js';

/**
 * Example: Basic SprintFund Protocol Usage
 */
async function example() {
  // Initialize client
  const client = new SprintFundClient('mainnet');

  console.log('SF Protocol SDK - Basic Usage Example');
  console.log('=====================================\n');

  // 1. Get proposals
  console.log('1. Fetching active proposals...');
  const activeProposals = await client.proposals.getActiveProposals(5);
  console.log(`Found ${activeProposals.length} active proposals\n`);

  // 2. Get stake balance
  console.log('2. Checking stake balance...');
  const address = toPrincipal('SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T');
  const balance = await client.stakes.getBalance(address);
  console.log(`Stake balance: ${balance || 'N/A'}\n`);

  // 3. Get voting power
  console.log('3. Checking voting power...');
  const votingPower = await client.voting.getVotingPower(address);
  if (votingPower) {
    console.log(`Max weight: ${votingPower.maxWeight}`);
    console.log(`Available: ${votingPower.available}\n`);
  }

  // 4. Estimate vote cost
  console.log('4. Estimating vote cost...');
  const estimate = await client.voting.estimateVoteCost(address, toBigIntString(5));
  if (estimate) {
    console.log(`Weight: ${estimate.weight}`);
    console.log(`Cost: ${estimate.cost}\n`);
  }

  // 5. Build transaction (validation only, not actual submission)
  console.log('5. Building stake transaction...');
  const stakeTx = await client.transactions.buildStakeTransaction(
    toBigIntString(1000000)
  );
  console.log(`Valid: ${stakeTx.isValid}`);
  if (stakeTx.errors.length > 0) {
    console.log(`Errors: ${stakeTx.errors.join(', ')}`);
  }
  console.log();

  // 6. Build proposal transaction
  console.log('6. Building proposal transaction...');
  const proposalTx = await client.transactions.buildCreateProposalTransaction(
    'Fund Developer Grant Program',
    'Allocate resources for developer education',
    toBigIntString(500000),
    1000
  );
  console.log(`Valid: ${proposalTx.isValid}`);
  console.log();

  // 7. Clear caches
  console.log('7. Clearing caches...');
  client.clearCaches();
  console.log('Caches cleared\n');

  console.log('✅ Example completed successfully!');
}

// Run example
example().catch(console.error);
