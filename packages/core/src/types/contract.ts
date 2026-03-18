import { Principal, BigIntString } from './index.js';

/**
 * Type guards for runtime type checking
 */

export function isPrincipal(value: unknown): value is Principal {
  if (typeof value !== 'string') return false;
  return /^(SP|SN)[A-Z0-9]{32}(\.[a-z0-9-]+)?$/.test(value);
}

export function isBigIntString(value: unknown): value is BigIntString {
  if (typeof value !== 'string') return false;
  return /^\d+$/.test(value);
}

export function isStacksAddress(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^(SP|SN)[A-Z0-9]{32}$/.test(value);
}

export function isProposal(value: unknown): value is Proposal {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isBigIntString(obj.id) &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    isPrincipal(obj.proposer) &&
    typeof obj.createdAt === 'number' &&
    typeof obj.endsAt === 'number' &&
    isBigIntString(obj.fundingGoal) &&
    isBigIntString(obj.fundingRaised) &&
    typeof obj.status === 'string'
  );
}

export function isVote(value: unknown): value is Vote {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isBigIntString(obj.proposalId) &&
    isPrincipal(obj.voter) &&
    typeof obj.direction === 'string' &&
    isBigIntString(obj.weight) &&
    typeof obj.votedAt === 'number' &&
    typeof obj.blockHeight === 'number'
  );
}

export function isStakeBalance(value: unknown): value is StakeBalance {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    isPrincipal(obj.holder) &&
    isBigIntString(obj.balance) &&
    typeof obj.stakedAt === 'number' &&
    typeof obj.blockHeight === 'number'
  );
}

/**
 * Contract type from Clarity
 */
export interface Proposal {
  id: BigIntString;
  title: string;
  description: string;
  proposer: Principal;
  createdAt: number;
  endsAt: number;
  fundingGoal: BigIntString;
  fundingRaised: BigIntString;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface Vote {
  proposalId: BigIntString;
  voter: Principal;
  direction: string;
  weight: BigIntString;
  votedAt: number;
  blockHeight: number;
}

export interface StakeBalance {
  holder: Principal;
  balance: BigIntString;
  stakedAt: number;
  blockHeight: number;
}

export interface VotingPower {
  maxWeight: BigIntString;
  currentUsed: BigIntString;
  available: BigIntString;
  stakeBalance: BigIntString;
}
