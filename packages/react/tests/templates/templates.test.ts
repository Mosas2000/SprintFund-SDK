import { describe, it, expect, beforeEach } from 'vitest';
import {
  TemplateRegistry,
  createTemplateRegistry,
  DefaultTemplates,
  globalTemplateRegistry
} from '../templates/registry';

describe('Community Templates', () => {
  describe('Template Registry', () => {
    let registry: TemplateRegistry;

    beforeEach(() => {
      registry = createTemplateRegistry();
    });

    it('should create template registry', () => {
      expect(registry).toBeDefined();
    });

    it('should register templates', () => {
      expect(registry.getAllTemplates().length).toBeGreaterThan(0);
    });

    it('should get template by ID', () => {
      const template = registry.getTemplate('proposal-vote');
      expect(template).toBeDefined();
      expect(template?.id).toBe('proposal-vote');
    });

    it('should get all templates', () => {
      const templates = registry.getAllTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(5);
    });

    it('should get templates by category', () => {
      const governanceTemplates = registry.getByCategory('governance');
      expect(governanceTemplates.length).toBeGreaterThan(0);
      governanceTemplates.forEach((t) => {
        expect(t.component).toBeDefined();
      });
    });

    it('should list categories', () => {
      const categories = registry.getCategories();
      expect(categories).toContain('governance');
      expect(categories).toContain('dashboard');
      expect(categories).toContain('wallet');
    });

    it('should search templates', () => {
      const results = registry.search('proposal');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((t) => {
        expect(
          t.name.toLowerCase().includes('proposal') ||
            t.description.toLowerCase().includes('proposal')
        ).toBe(true);
      });
    });

    it('should search case-insensitive', () => {
      const results1 = registry.search('proposal');
      const results2 = registry.search('PROPOSAL');
      expect(results1).toEqual(results2);
    });
  });

  describe('Default Templates', () => {
    it('should have proposal voting template', () => {
      expect(DefaultTemplates.proposalVote).toBeDefined();
      expect(DefaultTemplates.proposalVote.id).toBe('proposal-vote');
      expect(DefaultTemplates.proposalVote.component).toBeDefined();
    });

    it('should have stake dashboard template', () => {
      expect(DefaultTemplates.stakeDashboard).toBeDefined();
      expect(DefaultTemplates.stakeDashboard.component.layout).toBe('grid');
    });

    it('should have proposal creation template', () => {
      expect(DefaultTemplates.proposalCreate).toBeDefined();
      expect(DefaultTemplates.proposalCreate.component.fields).toBeDefined();
    });

    it('should have leaderboard template', () => {
      expect(DefaultTemplates.leaderboard).toBeDefined();
      expect(DefaultTemplates.leaderboard.component.columns).toBeDefined();
    });

    it('should have wallet connect template', () => {
      expect(DefaultTemplates.walletConnect).toBeDefined();
      expect(DefaultTemplates.walletConnect.component.sections).toBeDefined();
    });
  });

  describe('Template Structure', () => {
    it('should have consistent template structure', () => {
      const templates = globalTemplateRegistry.getAllTemplates();

      templates.forEach((template) => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.version).toBeDefined();
        expect(template.component).toBeDefined();
      });
    });

    it('should support default props', () => {
      const template = DefaultTemplates.proposalCreate;
      expect(template.component.fields).toBeDefined();
      template.component.fields.forEach((field: any) => {
        expect(field.name).toBeDefined();
        expect(field.type).toBeDefined();
      });
    });
  });

  describe('Category Organization', () => {
    it('should organize templates by category', () => {
      const governance = globalTemplateRegistry.getByCategory('governance');
      const dashboard = globalTemplateRegistry.getByCategory('dashboard');
      const wallet = globalTemplateRegistry.getByCategory('wallet');

      expect(governance.length).toBeGreaterThan(0);
      expect(dashboard.length).toBeGreaterThan(0);
      expect(wallet.length).toBeGreaterThan(0);
    });

    it('should retrieve all templates in a category', () => {
      const categories = globalTemplateRegistry.getCategories();
      categories.forEach((category) => {
        const templates = globalTemplateRegistry.getByCategory(category);
        expect(templates.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Template Search', () => {
    it('should find templates by keyword', () => {
      const results = globalTemplateRegistry.search('stake');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Stake');
    });

    it('should return empty array for no matches', () => {
      const results = globalTemplateRegistry.search('nonexistent-template-xyz');
      expect(results).toEqual([]);
    });

    it('should search description', () => {
      const results = globalTemplateRegistry.search('voting');
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
