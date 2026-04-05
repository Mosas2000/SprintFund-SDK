/**
 * Voting Power Display Component
 */

import React from 'react';

export interface VotingPowerProps {
  votingPower: bigint;
  stakedAmount: bigint;
  maxWeight?: number;
  loading?: boolean;
  className?: string;
}

export function VotingPower({
  votingPower,
  stakedAmount,
  maxWeight,
  loading = false,
  className = '',
}: VotingPowerProps) {
  const calculatedMaxWeight = maxWeight ?? Math.floor(Math.sqrt(Number(votingPower)));

  const formatNumber = (n: bigint): string => {
    return Number(n).toLocaleString();
  };

  if (loading) {
    return (
      <div
        className={`voting-power ${className}`}
        style={{
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
        }}
        aria-busy="true"
        aria-label="Loading voting power"
      >
        <div style={{ color: '#9ca3af' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`voting-power ${className}`}
      style={{
        padding: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#fff',
      }}
      role="region"
      aria-label="Voting power information"
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600, color: '#374151' }}>
        Your Voting Power
      </h3>

      <div style={{ display: 'grid', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#eff6ff',
            borderRadius: '6px',
          }}
        >
          <span style={{ color: '#1e40af', fontSize: '14px' }}>Total Power</span>
          <span style={{ color: '#1e40af', fontSize: '24px', fontWeight: 700 }}>
            {formatNumber(votingPower)}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#6b7280' }}>Staked STX</span>
          <span style={{ color: '#111827', fontWeight: 500 }}>
            {(Number(stakedAmount) / 1_000_000).toLocaleString()} STX
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#6b7280' }}>Max Vote Weight</span>
          <span style={{ color: '#111827', fontWeight: 500 }}>{calculatedMaxWeight}</span>
        </div>

        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          💡 Quadratic voting: Weight costs weight² power (e.g., weight 3 = 9 power)
        </div>
      </div>
    </div>
  );
}

export default VotingPower;
