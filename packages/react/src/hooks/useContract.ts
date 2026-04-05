/**
 * React hooks for SprintFund contract interactions
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  ContractExecutor,
  SprintFundContract,
  Proposal,
  StakeInfo,
  GovernanceConfig,
  VoteInfo,
} from '@sf-protocol/core';

// Hook state type
interface UseContractState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Hook result with refetch
interface UseContractResult<T> extends UseContractState<T> {
  refetch: () => Promise<void>;
}

// Generic fetch hook
function useContractFetch<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
): UseContractResult<T> {
  const [state, setState] = useState<UseContractState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...state, refetch: fetch };
}

// Proposal hooks
export function useProposal(
  contract: SprintFundContract | null,
  proposalId: number
): UseContractResult<Proposal | null> {
  return useContractFetch(
    async () => (contract ? contract.getProposal(proposalId) : null),
    [contract, proposalId]
  );
}

export function useProposals(
  contract: SprintFundContract | null,
  startId: number,
  count: number
): UseContractResult<Proposal[]> {
  return useContractFetch(
    async () => (contract ? contract.getProposals(startId, count) : []),
    [contract, startId, count]
  );
}

export function useProposalCount(
  contract: SprintFundContract | null
): UseContractResult<bigint> {
  return useContractFetch(
    async () => (contract ? contract.getProposalCount() : 0n),
    [contract]
  );
}

// Stake hooks
export function useStakeBalance(
  contract: SprintFundContract | null,
  address: string | null
): UseContractResult<bigint> {
  return useContractFetch(
    async () => (contract && address ? contract.getStakeBalance(address) : 0n),
    [contract, address]
  );
}

export function useVotingPower(
  contract: SprintFundContract | null,
  address: string | null
): UseContractResult<bigint> {
  return useContractFetch(
    async () => (contract && address ? contract.getVotingPower(address) : 0n),
    [contract, address]
  );
}

export function useStakeInfo(
  contract: SprintFundContract | null,
  address: string | null
): UseContractResult<StakeInfo> {
  return useContractFetch(
    async () =>
      contract && address
        ? contract.getStakeInfo(address)
        : { amount: 0n, stakedAt: 0n, votingPower: 0n },
    [contract, address]
  );
}

export function useTotalStaked(
  contract: SprintFundContract | null
): UseContractResult<bigint> {
  return useContractFetch(
    async () => (contract ? contract.getTotalStaked() : 0n),
    [contract]
  );
}

// Voting hooks
export function useHasVoted(
  contract: SprintFundContract | null,
  proposalId: number,
  voterAddress: string | null
): UseContractResult<boolean> {
  return useContractFetch(
    async () =>
      contract && voterAddress
        ? contract.hasVoted(proposalId, voterAddress)
        : false,
    [contract, proposalId, voterAddress]
  );
}

export function useProposalVotes(
  contract: SprintFundContract | null,
  proposalId: number
): UseContractResult<VoteInfo[]> {
  return useContractFetch(
    async () => (contract ? contract.getProposalVotes(proposalId) : []),
    [contract, proposalId]
  );
}

// Governance config hook
export function useGovernanceConfig(
  contract: SprintFundContract | null
): UseContractResult<GovernanceConfig | null> {
  return useContractFetch(
    async () => (contract ? contract.getGovernanceConfig() : null),
    [contract]
  );
}

// Transaction hooks
interface UseTransactionResult {
  execute: (...args: any[]) => Promise<{ txId: string } | null>;
  loading: boolean;
  error: Error | null;
  txId: string | null;
}

function useTransaction(
  fn: (...args: any[]) => Promise<{ txId: string }>
): UseTransactionResult {
  const [state, setState] = useState({
    loading: false,
    error: null as Error | null,
    txId: null as string | null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ loading: true, error: null, txId: null });
      try {
        const result = await fn(...args);
        setState({ loading: false, error: null, txId: result.txId });
        return result;
      } catch (error) {
        setState({ loading: false, error: error as Error, txId: null });
        return null;
      }
    },
    [fn]
  );

  return { execute, ...state };
}

export function useCreateProposal(
  contract: SprintFundContract | null
): UseTransactionResult {
  return useTransaction(
    async (title: string, description: string, amount: bigint) => {
      if (!contract) throw new Error('Contract not initialized');
      return contract.createProposal(title, description, amount);
    }
  );
}

export function useVote(
  contract: SprintFundContract | null
): UseTransactionResult {
  return useTransaction(
    async (proposalId: number, choice: boolean, weight: number) => {
      if (!contract) throw new Error('Contract not initialized');
      return contract.vote(proposalId, choice, weight);
    }
  );
}

export function useStake(
  contract: SprintFundContract | null,
  senderAddress?: string
): UseTransactionResult {
  return useTransaction(async (amount: bigint) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.stake(amount, senderAddress);
  });
}

export function useUnstake(
  contract: SprintFundContract | null
): UseTransactionResult {
  return useTransaction(async (amount: bigint) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.unstake(amount);
  });
}

export function useExecuteProposal(
  contract: SprintFundContract | null
): UseTransactionResult {
  return useTransaction(async (proposalId: number) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.executeProposal(proposalId);
  });
}

// Contract factory hook
export function useSprintFundContract(
  createContract: () => SprintFundContract | null,
  deps: any[] = []
): SprintFundContract | null {
  return useMemo(() => createContract(), deps);
}
