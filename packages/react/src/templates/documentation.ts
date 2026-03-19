/**
 * Template Documentation and Examples
 */

export const TemplateDocumentation = {
  proposalVote: {
    title: 'Proposal Voting Template',
    description: 'Display and vote on proposals with quadratic voting visualization',
    usage: `
import { useTemplate } from '@sf-protocol/react';

export function ProposalVote() {
  const { getTemplate } = useTemplate();
  const template = getTemplate('proposal-vote');
  
  return (
    <div className="proposal-card">
      {/* Render template */}
      {template?.component.sections.map(section => (
        <div key={section.type}>{section.content}</div>
      ))}
    </div>
  );
}
    `
  },

  stakeDashboard: {
    title: 'Stake Dashboard Template',
    description: 'Show stake balance, earnings, and transaction history',
    usage: `
import { useTemplate } from '@sf-protocol/react';

export function StakeDashboard() {
  const { getTemplate } = useTemplate();
  const template = getTemplate('stake-dashboard');
  
  return (
    <div className="dashboard-grid">
      {template?.component.sections.map(section => (
        <section key={section.type}>{section.content}</section>
      ))}
    </div>
  );
}
    `
  },

  proposalCreate: {
    title: 'Create Proposal Template',
    description: 'Form template for submitting new proposals',
    usage: `
import { useTemplate } from '@sf-protocol/react';

export function CreateProposal() {
  const { getTemplate } = useTemplate();
  const template = getTemplate('proposal-create');
  
  return (
    <form>
      {template?.component.fields.map(field => (
        <input
          key={field.name}
          type={field.type}
          name={field.name}
          required={field.required}
          placeholder={field.name}
        />
      ))}
      <button type="submit">Create Proposal</button>
    </form>
  );
}
    `
  },

  leaderboard: {
    title: 'Leaderboard Template',
    description: 'Display ranked list of stakeholders and contributors',
    usage: `
import { useTemplate } from '@sf-protocol/react';

export function Leaderboard() {
  const { getTemplate } = useTemplate();
  const template = getTemplate('leaderboard');
  
  return (
    <table>
      <thead>
        <tr>
          {template?.component.columns.map(col => (
            <th key={col.name}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Add rows here */}
      </tbody>
    </table>
  );
}
    `
  },

  walletConnect: {
    title: 'Wallet Connection Template',
    description: 'UI for wallet connection, account switching, and network selection',
    usage: `
import { useWallet, useTemplate } from '@sf-protocol/react';

export function WalletUI() {
  const { isConnected, connect, disconnect } = useWallet({
    projectId: 'your-project-id',
    metadata: { name: 'App', description: 'App', url: 'https://app.com', icons: [] }
  });
  
  const { getTemplate } = useTemplate();
  const template = getTemplate('wallet-connect');
  
  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={isConnected ? disconnect : connect}>
        {isConnected ? 'Disconnect' : 'Connect Wallet'}
      </button>
    </div>
  );
}
    `
  }
};

/**
 * Template customization guide
 */
export const CustomizationGuide = {
  extending: `
To extend templates with custom configuration:

import { createTemplateRegistry, DefaultTemplates } from '@sf-protocol/react';

const registry = createTemplateRegistry();

// Customize existing template
const customTemplate = {
  ...DefaultTemplates.proposalVote,
  id: 'custom-proposal-vote',
  name: 'Custom Proposal Vote',
  defaultProps: {
    theme: 'dark',
    showTimer: true
  }
};

registry.register(customTemplate, 'custom');
  `,

  creating: `
To create new custom templates:

import { TemplateRegistry } from '@sf-protocol/react';

const registry = new TemplateRegistry();

registry.register({
  id: 'custom-component',
  name: 'My Custom Component',
  description: 'A custom component template',
  version: '1.0.0',
  component: {
    layout: 'card',
    sections: [
      { type: 'header', content: 'Title' }
    ]
  }
}, 'custom');
  `
};
