/**
 * @sf-protocol/testing - Main Entry Point
 */

// Mocks
export { MockContractProvider, createMockContractProvider } from './mocks/contract-provider';
export type { MockContractConfig } from './mocks/contract-provider';

// Fixtures
export {
  sampleProposal,
  createSampleProposals,
  sampleVote,
  createSampleVotes,
  testAddresses,
  proposalScenarios,
  voteScenarios
} from './fixtures/proposals';

// Factories
export {
  ProposalFactory,
  VoteFactory,
  StakeBalanceFactory
} from './factories/proposal-factory';

// Test Helpers
export {
  assertProposal,
  assertVote,
  assertStakeBalance,
  createVoter,
  proposalsEqual,
  votesEqual,
  waitFor,
  createMockError,
  CallTracker,
  TimeMock
} from './utils/test-helpers';
