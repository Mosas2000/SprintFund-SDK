/**
 * Component Template System
 * 
 * Reusable component templates and patterns for common governance UI needs.
 */

export interface TemplateConfig {
  /**
   * Template ID
   */
  id: string;

  /**
   * Template name
   */
  name: string;

  /**
   * Template description
   */
  description: string;

  /**
   * Template version
   */
  version: string;

  /**
   * Component structure
   */
  component: Record<string, any>;

  /**
   * Default props
   */
  defaultProps?: Record<string, any>;

  /**
   * Customization options
   */
  options?: Record<string, any>;
}

/**
 * Template registry
 */
export class TemplateRegistry {
  private templates: Map<string, TemplateConfig> = new Map();
  private categories: Map<string, string[]> = new Map();

  /**
   * Register template
   */
  register(template: TemplateConfig, category?: string): void {
    this.templates.set(template.id, template);

    if (category) {
      if (!this.categories.has(category)) {
        this.categories.set(category, []);
      }
      this.categories.get(category)!.push(template.id);
    }
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): TemplateConfig | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getByCategory(category: string): TemplateConfig[] {
    const ids = this.categories.get(category) || [];
    return ids
      .map((id) => this.templates.get(id))
      .filter((t) => t !== undefined) as TemplateConfig[];
  }

  /**
   * List all categories
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Search templates
   */
  search(query: string): TemplateConfig[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter((t) => {
      return (
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery)
      );
    });
  }
}

/**
 * Predefined templates
 */
export const DefaultTemplates = {
  /**
   * Proposal voting UI
   */
  proposalVote: {
    id: 'proposal-vote',
    name: 'Proposal Voting',
    description: 'Vote on active proposals with quadratic voting display',
    version: '1.0.0',
    component: {
      layout: 'card',
      sections: [
        { type: 'header', content: 'Proposal Title' },
        { type: 'description', content: 'Proposal description' },
        { type: 'votes', content: 'Vote counts' },
        { type: 'actions', content: 'Vote buttons' }
      ]
    }
  } as TemplateConfig,

  /**
   * Stake dashboard
   */
  stakeDashboard: {
    id: 'stake-dashboard',
    name: 'Stake Dashboard',
    description: 'Display stake balance and earnings',
    version: '1.0.0',
    component: {
      layout: 'grid',
      sections: [
        { type: 'summary', content: 'Total staked' },
        { type: 'earnings', content: 'Earnings breakdown' },
        { type: 'history', content: 'Transaction history' }
      ]
    }
  } as TemplateConfig,

  /**
   * Proposal creation form
   */
  proposalCreate: {
    id: 'proposal-create',
    name: 'Create Proposal',
    description: 'Form for creating new proposals',
    version: '1.0.0',
    component: {
      layout: 'form',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'duration', type: 'number', required: true },
        { name: 'category', type: 'select', options: [] }
      ]
    }
  } as TemplateConfig,

  /**
   * Leaderboard
   */
  leaderboard: {
    id: 'leaderboard',
    name: 'Leaderboard',
    description: 'Top stakeholders and contributors',
    version: '1.0.0',
    component: {
      layout: 'table',
      columns: [
        { name: 'rank', label: 'Rank' },
        { name: 'name', label: 'Name' },
        { name: 'stake', label: 'Stake' },
        { name: 'votes', label: 'Votes' }
      ]
    }
  } as TemplateConfig,

  /**
   * Wallet connection UI
   */
  walletConnect: {
    id: 'wallet-connect',
    name: 'Wallet Connection',
    description: 'Wallet connection and account switching',
    version: '1.0.0',
    component: {
      layout: 'card',
      sections: [
        { type: 'status', content: 'Connection status' },
        { type: 'account', content: 'Current account' },
        { type: 'networks', content: 'Available networks' },
        { type: 'actions', content: 'Connect/disconnect' }
      ]
    }
  } as TemplateConfig
};

/**
 * Create template registry with defaults
 */
export function createTemplateRegistry(): TemplateRegistry {
  const registry = new TemplateRegistry();

  // Register default templates
  registry.register(DefaultTemplates.proposalVote, 'governance');
  registry.register(DefaultTemplates.stakeDashboard, 'dashboard');
  registry.register(DefaultTemplates.proposalCreate, 'governance');
  registry.register(DefaultTemplates.leaderboard, 'dashboard');
  registry.register(DefaultTemplates.walletConnect, 'wallet');

  return registry;
}

export const globalTemplateRegistry = createTemplateRegistry();
