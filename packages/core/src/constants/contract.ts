import { BigIntString, Principal } from './index.js';

/**
 * Contract principal for SprintFund on Stacks mainnet
 */
export const SPRINTFUND_CONTRACT_PRINCIPAL =
  'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3';

/**
 * Contract name
 */
export const SPRINTFUND_CONTRACT_NAME = 'sprintfund-core-v3';

/**
 * Contract address
 */
export const SPRINTFUND_CONTRACT_ADDRESS =
  'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';

/**
 * Error codes from the contract
 */
export enum ContractErrorCode {
  ERR_INVALID_PROPOSAL_ID = 1,
  ERR_PROPOSAL_INACTIVE = 2,
  ERR_INSUFFICIENT_STAKE = 3,
  ERR_INVALID_VOTE_WEIGHT = 4,
  ERR_DUPLICATE_VOTE = 5,
  ERR_PROPOSAL_NOT_ENDED = 6,
  ERR_UNAUTHORIZED = 7,
  ERR_INVALID_PARAMETERS = 8,
  ERR_INSUFFICIENT_FUNDS = 9,
  ERR_INVALID_ADDRESS = 10,
}

/**
 * Proposal status enum
 */
export enum ProposalStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Vote direction
 */
export enum VoteDirection {
  FOR = 'FOR',
  AGAINST = 'AGAINST',
  ABSTAIN = 'ABSTAIN',
}

/**
 * Clarity value type discriminator
 */
export type ClarityType =
  | 'uint'
  | 'int'
  | 'bool'
  | 'principal'
  | 'buff'
  | 'optional'
  | 'list'
  | 'tuple'
  | 'response';

/**
 * Contract function type
 */
export type ContractFunction = 'read_only' | 'public' | 'private';

/**
 * Network type for Stacks
 */
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

export interface ContractReadResponse {
  okay: boolean;
  result?: string;
  error?: string;
}

export interface ContractTxData {
  contract: string;
  function: string;
  args: unknown[];
}
