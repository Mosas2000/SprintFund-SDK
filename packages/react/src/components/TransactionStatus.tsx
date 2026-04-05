/**
 * Transaction Status Component
 */

import React from 'react';

export type TransactionStatusType = 'pending' | 'submitted' | 'confirmed' | 'failed';

export interface TransactionStatusProps {
  status: TransactionStatusType;
  txId?: string;
  message?: string;
  explorerUrl?: string;
  onClose?: () => void;
  className?: string;
}

const statusConfig: Record<
  TransactionStatusType,
  { icon: string; color: string; bgColor: string; label: string }
> = {
  pending: { icon: '⏳', color: '#d97706', bgColor: '#fef3c7', label: 'Transaction Pending' },
  submitted: { icon: '📤', color: '#2563eb', bgColor: '#dbeafe', label: 'Transaction Submitted' },
  confirmed: { icon: '✅', color: '#16a34a', bgColor: '#dcfce7', label: 'Transaction Confirmed' },
  failed: { icon: '❌', color: '#dc2626', bgColor: '#fee2e2', label: 'Transaction Failed' },
};

export function TransactionStatus({
  status,
  txId,
  message,
  explorerUrl,
  onClose,
  className = '',
}: TransactionStatusProps) {
  const config = statusConfig[status];

  const truncateTxId = (id: string) =>
    id.length > 16 ? `${id.slice(0, 8)}...${id.slice(-6)}` : id;

  return (
    <div
      className={`transaction-status ${className}`}
      role="status"
      aria-live="polite"
      style={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}20`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '24px' }} aria-hidden="true">
          {config.icon}
        </span>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontWeight: 600, color: config.color }}>{config.label}</span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#9ca3af',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>

          {message && (
            <p style={{ margin: '0 0 8px', color: '#374151', fontSize: '14px' }}>{message}</p>
          )}

          {txId && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              TX: {explorerUrl ? (
                <a
                  href={`${explorerUrl}/txid/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: config.color, textDecoration: 'underline' }}
                >
                  {truncateTxId(txId)}
                </a>
              ) : (
                <span style={{ fontFamily: 'monospace' }}>{truncateTxId(txId)}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {status === 'pending' && (
        <div
          style={{
            marginTop: '12px',
            height: '4px',
            backgroundColor: `${config.color}30`,
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '30%',
              height: '100%',
              backgroundColor: config.color,
              animation: 'slide 1.5s infinite',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default TransactionStatus;
