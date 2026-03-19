/**
 * Template Hook for Using Templates
 */

import { useMemo } from 'react';
import { TemplateRegistry, TemplateConfig, globalTemplateRegistry } from '../templates/registry';

export interface UseTemplateOptions {
  /**
   * Template registry to use
   */
  registry?: TemplateRegistry;

  /**
   * Auto-load default templates
   */
  autoLoad?: boolean;
}

/**
 * Hook for accessing templates
 */
export function useTemplate(options?: UseTemplateOptions) {
  const registry = options?.registry || globalTemplateRegistry;

  return useMemo(
    () => ({
      /**
       * Get template by ID
       */
      getTemplate: (id: string): TemplateConfig | undefined => {
        return registry.getTemplate(id);
      },

      /**
       * Get all templates
       */
      getAllTemplates: (): TemplateConfig[] => {
        return registry.getAllTemplates();
      },

      /**
       * Get templates by category
       */
      getByCategory: (category: string): TemplateConfig[] => {
        return registry.getByCategory(category);
      },

      /**
       * Get categories
       */
      getCategories: (): string[] => {
        return registry.getCategories();
      },

      /**
       * Search templates
       */
      search: (query: string): TemplateConfig[] => {
        return registry.search(query);
      }
    }),
    [registry]
  );
}

export default useTemplate;
