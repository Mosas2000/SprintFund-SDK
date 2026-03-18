import { BigIntString, Principal } from './index.js';

/**
 * Stake balance data
 */
export interface StakeBalance {
  holder: Principal;
  balance: BigIntString;
  stakedAt: number;
  blockHeight: number;
}

/**
 * Stake transaction parameters
 */
export interface StakeParams {
  amount: BigIntString;
}

/**
 * Unstake transaction parameters
 */
export interface UnstakeParams {
  amount: BigIntString;
}

/**
 * Stake action result
 */
export interface StakeResult {
  transactionId: string;
  holder: Principal;
  amount: BigIntString;
  action: 'deposit' | 'withdrawal';
  blockHeight: number;
}

/**
 * Stake history entry
 */
export interface StakeHistoryEntry {
  holder: Principal;
  balance: BigIntString;
  timestamp: number;
  blockHeight: number;
  change: BigIntString;
  changeType: 'deposit' | 'withdrawal';
}

/**
 * Min and max stake amounts
 */
export interface StakeLimits {
  minStake: BigIntString;
  maxStake: BigIntString;
  stakeFloor: BigIntString;
}

export interface StakeListOptions {
  limit: number;
  offset: number;
  minBalance?: BigIntString;
}
