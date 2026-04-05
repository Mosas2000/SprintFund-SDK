/**
 * Proposal Card Component
 */

import React from 'react';

export interface ProposalCardProps {
  id: number | bigint;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'executed' | 'pending';
  votesFor: bigint;
  votesAgainst: bigint;
  creator: string;
  createdAt?: Date;
  onClick?: () => void;
  className?: string;
}

const statusColors: Record<ProposalCardProps['status'], string> = {
  active: '#3b82f6',
  passed: '#22c55e',
  rejected: '#ef4444',
  executed: '#8b5cf6',
  pending: '#f59e0b',
};

const statusLabels: Record<ProposalCardProps['status'], string> = {
  active: 'Active',
  passed: 'Passed',
  rejected: 'Rejected',
  executed: 'Executed',
  pending: 'Pending',
};

export function ProposalCard({
  id,
  title,
  description,
  status,
  votesFor,
  votesAgainst,
  creator,
  createdAt,
  onClick,
  className = '',
}: ProposalCardProps) {
  const totalVotes = votesFor + votesAgainst;
  const forPercent = totalVotes > 0n ? Number((votesFor * 100n) / totalVotes) : 0;
  const againstPercent = totalVotes > 0n ? Number((votesAgainst * 100n) / totalVotes) : 0;

  const truncateAddress = (addr: string) =>
    addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  return (
    <div
      role="article"
      aria-labelledby={`proposal-${id}-title`}
      className={`proposal-card ${className}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      tabIndex={onClick ? 0 : undefined}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#6b7280', fontSize: '12px' }}>#{String(id)}</span>
        <span
          style={{
            backgroundColor: statusColors[status],
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        >
          {statusLabels[status]}
        </span>
      </div>

      <h3
        id={`proposal-${id}-title`}
        style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}
      >
        {title}
      </h3>

      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 12px' }}>
        {description.length > 120 ? `${description.slice(0, 120)}...` : description}
      </p>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: '#22c55e' }}>For: {forPercent}%</span>
          <span style={{ fontSize: '12px', color: '#ef4444' }}>Against: {againstPercent}%</span>
        </div>
        <div
          style={{
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden',
            display: 'flex',
          }}
          role="progressbar"
          aria-valuenow={forPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${forPercent}% votes for, ${againstPercent}% votes against`}
        >
          <div style={{ width: `${forPercent}%`, backgroundColor: '#22c55e' }} />
          <div style={{ width: `${againstPercent}%`, backgroundColor: '#ef4444' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
        <span>By: {truncateAddress(creator)}</span>
        {createdAt && <span>{createdAt.toLocaleDateString()}</span>}
      </div>
    </div>
  );
}

export default ProposalCard;
