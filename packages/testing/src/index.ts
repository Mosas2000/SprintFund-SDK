/**
 * Testing utilities exports
 */

// Mocks
export { MockContractExecutor, createMockExecutor, type MockContractState } from './mocks/contract-executor';
export { MockWalletAdapter, createMockWallet, type MockWalletState, type MockTransaction } from './mocks/wallet-adapter';

// Fixtures
export {
  ADDRESSES,
  PROPOSALS,
  VOTES,
  STAKES,
  GOVERNANCE_CONFIG,
  createProposal,
  createVote,
  createStake,
  randomAddress,
  randomProposals,
  type ProposalFixture,
  type VoteFixture,
  type StakeFixture,
} from './fixtures/governance';

// Test helpers
export {
  wait,
  waitFor,
  waitForCondition,
  createTestContext,
  assertBigInt,
  assertDeepEqual,
  EventTracker,
  createSnapshot,
  compareSnapshots,
  MockTimer,
  type TestContext,
} from './helpers/test-utils';

// React testing
export {
  fireEvent,
  waitForUpdate,
  createMockHook,
  createWrapper,
  checkA11y,
  PropsSpy,
  StateTracker,
  type RenderResult,
  type MockHookState,
} from './helpers/react-utils';