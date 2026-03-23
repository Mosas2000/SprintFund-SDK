/**
 * SF Protocol React Example
 * Demonstrates React hooks and components
 */

import React, { useState } from 'react';
import {
  SprintFundProvider,
  useProposals,
  useProposal,
  useVote,
  useStake,
  useWallet,
  useRealtime,
  useCache,
  useAriaLive,
  CacheStrategies,
} from '@sf-protocol/react';

// Proposal List Component
function ProposalList() {
  const { proposals, loading, error, refetch } = useProposals();
  const { announce } = useAriaLive();

  if (loading) return <div aria-busy="true">Loading proposals...</div>;
  if (error) return <div role="alert">Error: {error.message}</div>;

  const handleRefresh = async () => {
    await refetch();
    announce('Proposals refreshed');
  };

  return (
    <div>
      <h2>Proposals</h2>
      <button onClick={handleRefresh}>Refresh</button>
      <ul role="list">
        {proposals?.map((p) => (
          <li key={p.id}>
            <strong>{p.title}</strong> - {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Proposal Detail Component
function ProposalDetail({ id }: { id: number }) {
  const { proposal, loading, error } = useProposal(id);
  const { vote, loading: voting } = useVote();
  const { announce } = useAriaLive();

  const handleVote = async (choice: 'for' | 'against') => {
    try {
      await vote(id, choice, 10);
      announce(`Vote ${choice} submitted successfully`);
    } catch (err) {
      announce('Vote failed');
    }
  };

  if (loading) return <div>Loading proposal...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!proposal) return <div>Proposal not found</div>;

  return (
    <article>
      <h2>{proposal.title}</h2>
      <p>{proposal.description}</p>
      <dl>
        <dt>Status</dt>
        <dd>{proposal.status}</dd>
        <dt>Votes For</dt>
        <dd>{proposal.votesFor.toString()}</dd>
        <dt>Votes Against</dt>
        <dd>{proposal.votesAgainst.toString()}</dd>
      </dl>
      <div role="group" aria-label="Voting actions">
        <button onClick={() => handleVote('for')} disabled={voting}>
          Vote For
        </button>
        <button onClick={() => handleVote('against')} disabled={voting}>
          Vote Against
        </button>
      </div>
    </article>
  );
}

// Wallet Connection Component
function WalletConnect() {
  const { connect, disconnect, address, connected } = useWallet();
  const { announce } = useAriaLive();

  const handleConnect = async () => {
    try {
      await connect('stacks');
      announce('Wallet connected');
    } catch (err) {
      announce('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    announce('Wallet disconnected');
  };

  if (connected) {
    return (
      <div>
        <span>Connected: {address?.slice(0, 8)}...</span>
        <button onClick={handleDisconnect}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={handleConnect}>Connect Wallet</button>;
}

// Stake Balance Component
function StakeBalance({ address }: { address: string }) {
  const { balance, loading } = useStake(address);

  if (loading) return <span>Loading...</span>;

  return (
    <div>
      <strong>Stake Balance:</strong> {balance?.toString() ?? '0'} STX
    </div>
  );
}

// Real-time Updates Component
function RealtimeUpdates() {
  const [events, setEvents] = useState<string[]>([]);
  const { subscribe, connected } = useRealtime('wss://api.sf-protocol.io/ws');

  React.useEffect(() => {
    const unsubscribe = subscribe('proposal:created', (data: any) => {
      setEvents((prev) => [...prev, `New proposal: ${data.title}`]);
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <div>
      <h3>Real-time Events {connected ? '🟢' : '🔴'}</h3>
      <ul>
        {events.map((event, i) => (
          <li key={i}>{event}</li>
        ))}
      </ul>
    </div>
  );
}

// Cached Data Component
function CachedProposals() {
  const { data, isStale, refresh } = useCache(
    'proposals',
    async () => {
      // Fetch logic
      return [];
    },
    { strategy: CacheStrategies.STANDARD }
  );

  return (
    <div>
      <h3>Cached Proposals {isStale && '(stale)'}</h3>
      <button onClick={refresh}>Refresh</button>
      <span>Count: {data?.length ?? 0}</span>
    </div>
  );
}

// Main App
function App() {
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  return (
    <div>
      <header>
        <h1>SF Protocol Demo</h1>
        <WalletConnect />
      </header>

      <main>
        <section>
          <ProposalList />
        </section>

        {selectedProposal && (
          <section>
            <ProposalDetail id={selectedProposal} />
          </section>
        )}

        <section>
          <RealtimeUpdates />
        </section>

        <section>
          <CachedProposals />
        </section>
      </main>
    </div>
  );
}

// Root with Provider
export default function Root() {
  return (
    <SprintFundProvider network="mainnet">
      <App />
    </SprintFundProvider>
  );
}
