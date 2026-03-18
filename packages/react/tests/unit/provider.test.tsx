import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SprintFundProvider } from '../src/provider/SprintFundProvider.js';
import { useClient } from '../src/hooks/useClient.js';
import React from 'react';

describe('React Hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient();
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(SprintFundProvider, { network: 'mainnet' }, children)
      );
  };

  describe('useClient', () => {
    it('should provide client from context', () => {
      const { result } = renderHook(() => useClient(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current?.proposals).toBeDefined();
      expect(result.current?.stakes).toBeDefined();
      expect(result.current?.voting).toBeDefined();
      expect(result.current?.transactions).toBeDefined();
    });

    it('should throw when used outside provider', () => {
      expect(() => {
        renderHook(() => useClient());
      }).toThrow('useClient must be used within SprintFundProvider');
    });
  });

  describe('SprintFundProvider', () => {
    it('should create mainnet client', () => {
      const { result } = renderHook(() => useClient(), {
        wrapper: ({ children }: { children: React.ReactNode }) => {
          const queryClient = new QueryClient();
          return React.createElement(
            QueryClientProvider,
            { client: queryClient },
            React.createElement(SprintFundProvider, { network: 'mainnet' }, children)
          );
        },
      });

      expect(result.current?.getNetwork()).toBe('mainnet');
    });

    it('should create testnet client', () => {
      const { result } = renderHook(() => useClient(), {
        wrapper: ({ children }: { children: React.ReactNode }) => {
          const queryClient = new QueryClient();
          return React.createElement(
            QueryClientProvider,
            { client: queryClient },
            React.createElement(SprintFundProvider, { network: 'testnet' }, children)
          );
        },
      });

      expect(result.current?.getNetwork()).toBe('testnet');
    });
  });
});
