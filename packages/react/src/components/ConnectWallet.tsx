/**
 * Connect Wallet Button Component
 */

import React from 'react';

export interface ConnectWalletProps {
  connected: boolean;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
  className?: string;
}

export function ConnectWallet({
  connected,
  address,
  onConnect,
  onDisconnect,
  loading = false,
  className = '',
}: ConnectWalletProps) {
  const truncateAddress = (addr: string) =>
    addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className={`connect-wallet ${className}`}
        style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#e5e7eb',
          color: '#9ca3af',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'not-allowed',
        }}
        aria-busy="true"
      >
        Connecting...
      </button>
    );
  }

  if (connected && address) {
    return (
      <div
        className={`connect-wallet connected ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#374151',
          }}
          title={address}
        >
          {truncateAddress(address)}
        </span>
        <button
          type="button"
          onClick={onDisconnect}
          aria-label="Disconnect wallet"
          style={{
            padding: '4px 8px',
            marginLeft: '4px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onConnect}
      className={`connect-wallet ${className}`}
      style={{
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#f97316',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.backgroundColor = '#ea580c';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.backgroundColor = '#f97316';
      }}
    >
      🔗 Connect Wallet
    </button>
  );
}

export default ConnectWallet;
