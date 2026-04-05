/**
 * Proposal List Component
 */

import React from 'react';
import { ProposalCard, ProposalCardProps } from './ProposalCard';

export interface ProposalListProps {
  proposals: Omit<ProposalCardProps, 'onClick'>[];
  loading?: boolean;
  emptyMessage?: string;
  onProposalClick?: (id: number | bigint) => void;
  className?: string;
}

export function ProposalList({
  proposals,
  loading = false,
  emptyMessage = 'No proposals found',
  onProposalClick,
  className = '',
}: ProposalListProps) {
  if (loading) {
    return (
      <div
        className={`proposal-list ${className}`}
        aria-busy="true"
        aria-label="Loading proposals"
        style={{ display: 'grid', gap: '16px' }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '180px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              animation: 'pulse 2s infinite',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div
        className={`proposal-list-empty ${className}`}
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}
        role="status"
      >
        <p style={{ margin: 0, fontSize: '16px' }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`proposal-list ${className}`}
      style={{ display: 'grid', gap: '16px' }}
      role="feed"
      aria-label="Proposals"
    >
      {proposals.map((proposal) => (
        <ProposalCard
          key={String(proposal.id)}
          {...proposal}
          onClick={onProposalClick ? () => onProposalClick(proposal.id) : undefined}
        />
      ))}
    </div>
  );
}

export default ProposalList;
