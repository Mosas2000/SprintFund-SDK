/**
 * Stake Form Component
 */

import React, { useState } from 'react';

export interface StakeFormProps {
  balance?: bigint;
  stakedAmount?: bigint;
  onStake: (amount: bigint) => Promise<void>;
  onUnstake: (amount: bigint) => Promise<void>;
  minStake?: bigint;
  loading?: boolean;
  className?: string;
}

export function StakeForm({
  balance = 0n,
  stakedAmount = 0n,
  onStake,
  onUnstake,
  minStake = 1000000n, // 1 STX in microSTX
  loading = false,
  className = '',
}: StakeFormProps) {
  const [mode, setMode] = useState<'stake' | 'unstake'>('stake');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatSTX = (microSTX: bigint): string => {
    const stx = Number(microSTX) / 1_000_000;
    return stx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  };

  const parseSTX = (stx: string): bigint => {
    const num = parseFloat(stx);
    if (isNaN(num) || num < 0) return 0n;
    return BigInt(Math.floor(num * 1_000_000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountMicroSTX = parseSTX(amount);
    if (amountMicroSTX <= 0n) {
      setError('Please enter a valid amount');
      return;
    }

    if (mode === 'stake') {
      if (amountMicroSTX > balance) {
        setError('Insufficient balance');
        return;
      }
      if (amountMicroSTX < minStake) {
        setError(`Minimum stake is ${formatSTX(minStake)} STX`);
        return;
      }
    } else {
      if (amountMicroSTX > stakedAmount) {
        setError('Cannot unstake more than staked amount');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'stake') {
        await onStake(amountMicroSTX);
      } else {
        await onUnstake(amountMicroSTX);
      }
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxAmount = () => {
    const maxAmount = mode === 'stake' ? balance : stakedAmount;
    setAmount(formatSTX(maxAmount));
  };

  return (
    <div
      className={`stake-form ${className}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ display: 'flex', marginBottom: '16px', borderRadius: '6px', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setMode('stake')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            backgroundColor: mode === 'stake' ? '#3b82f6' : '#e5e7eb',
            color: mode === 'stake' ? '#fff' : '#374151',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Stake
        </button>
        <button
          type="button"
          onClick={() => setMode('unstake')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            backgroundColor: mode === 'unstake' ? '#3b82f6' : '#e5e7eb',
            color: mode === 'unstake' ? '#fff' : '#374151',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Unstake
        </button>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Available Balance:</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>{formatSTX(balance)} STX</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Currently Staked:</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>{formatSTX(stakedAmount)} STX</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="stake-amount" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            Amount (STX)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="stake-amount"
              type="number"
              step="0.000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading || isSubmitting}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              aria-describedby={error ? 'stake-error' : undefined}
            />
            <button
              type="button"
              onClick={setMaxAmount}
              disabled={loading || isSubmitting}
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
              }}
            >
              Max
            </button>
          </div>
        </div>

        {error && (
          <div
            id="stake-error"
            role="alert"
            style={{
              padding: '8px 12px',
              marginBottom: '12px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isSubmitting || !amount}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: loading || isSubmitting ? '#d1d5db' : '#3b82f6',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading || isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Processing...' : mode === 'stake' ? 'Stake STX' : 'Unstake STX'}
        </button>
      </form>
    </div>
  );
}

export default StakeForm;
