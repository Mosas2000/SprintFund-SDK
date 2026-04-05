/**
 * Vote Button Component
 */

import React, { useState } from 'react';

export interface VoteButtonProps {
  proposalId: number;
  choice: 'for' | 'against';
  disabled?: boolean;
  loading?: boolean;
  votingPower?: bigint;
  maxWeight?: number;
  onVote: (choice: boolean, weight: number) => Promise<void>;
  className?: string;
}

export function VoteButton({
  proposalId,
  choice,
  disabled = false,
  loading = false,
  votingPower = 0n,
  maxWeight = 10,
  onVote,
  className = '',
}: VoteButtonProps) {
  const [weight, setWeight] = useState(1);
  const [showWeightSelector, setShowWeightSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFor = choice === 'for';
  const baseColor = isFor ? '#22c55e' : '#ef4444';
  const hoverColor = isFor ? '#16a34a' : '#dc2626';

  const handleVote = async () => {
    if (disabled || loading || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onVote(isFor, weight);
    } finally {
      setIsSubmitting(false);
      setShowWeightSelector(false);
    }
  };

  const quadraticCost = BigInt(weight * weight);
  const canAfford = votingPower >= quadraticCost;

  return (
    <div className={`vote-button-container ${className}`}>
      <button
        type="button"
        disabled={disabled || loading || isSubmitting || !canAfford}
        onClick={() => setShowWeightSelector(!showWeightSelector)}
        aria-label={`Vote ${choice} on proposal ${proposalId}`}
        aria-expanded={showWeightSelector}
        style={{
          backgroundColor: disabled ? '#d1d5db' : baseColor,
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!disabled) (e.target as HTMLButtonElement).style.backgroundColor = hoverColor;
        }}
        onMouseLeave={(e) => {
          if (!disabled) (e.target as HTMLButtonElement).style.backgroundColor = baseColor;
        }}
      >
        {loading || isSubmitting ? (
          <span aria-live="polite">Voting...</span>
        ) : (
          <>
            {isFor ? '👍' : '👎'} Vote {choice.charAt(0).toUpperCase() + choice.slice(1)}
          </>
        )}
      </button>

      {showWeightSelector && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: '#f9fafb',
          }}
          role="dialog"
          aria-label="Select vote weight"
        >
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
            Vote Weight: {weight}
          </label>
          <input
            type="range"
            min={1}
            max={maxWeight}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '8px' }}
            aria-label="Vote weight slider"
          />
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Cost: {quadraticCost.toString()} voting power
            {!canAfford && (
              <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                (Insufficient power: {votingPower.toString()})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleVote}
            disabled={!canAfford || isSubmitting}
            style={{
              backgroundColor: canAfford ? baseColor : '#d1d5db',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              width: '100%',
              cursor: canAfford ? 'pointer' : 'not-allowed',
            }}
          >
            Confirm Vote
          </button>
        </div>
      )}
    </div>
  );
}

export default VoteButton;
