import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WalletConnectManager,
  createWalletConnectManager,
  WalletSession
} from '../wallet/walletconnect';

describe('WalletConnect v2 Integration', () => {
  describe('WalletConnect Manager', () => {
    let manager: WalletConnectManager;

    beforeEach(() => {
      manager = createWalletConnectManager({
        projectId: 'test-project-id',
        metadata: {
          name: 'Test App',
          description: 'Test',
          url: 'https://example.com',
          icons: ['https://example.com/icon.png']
        }
      });
    });

    it('should create wallet manager', () => {
      expect(manager).toBeDefined();
      expect(manager.getSession()).toBeNull();
      expect(manager.isConnected()).toBe(false);
    });

    it('should connect wallet', async () => {
      const session = await manager.connect();

      expect(session).toBeDefined();
      expect(session.account).toBeDefined();
      expect(session.accounts.length).toBeGreaterThan(0);
      expect(manager.isConnected()).toBe(true);
    });

    it('should disconnect wallet', async () => {
      await manager.connect();
      expect(manager.isConnected()).toBe(true);

      await manager.disconnect();
      expect(manager.isConnected()).toBe(false);
      expect(manager.getSession()).toBeNull();
    });

    it('should get active account', async () => {
      const session = await manager.connect();
      const account = manager.getAccount();

      expect(account).toEqual(session.account);
      expect(account?.address).toBeDefined();
    });

    it('should switch account', async () => {
      const session = await manager.connect();
      const initialAccount = session.account;

      // Switch to another account if available
      if (session.accounts.length > 1) {
        const newAddress = session.accounts[1].address;
        const switched = await manager.switchAccount(newAddress);

        expect(switched.address).toBe(newAddress);
        expect(manager.getAccount()?.address).toBe(newAddress);
      }
    });

    it('should support multiple chains', async () => {
      const session = await manager.connect(['stacks-mainnet', 'ethereum-mainnet']);

      expect(session.accounts).toBeDefined();
      expect(session.accounts.length).toBeGreaterThanOrEqual(2);
    });

    it('should emit connection events', (done) => {
      const handler = vi.fn();
      manager.on('wallet:connected', handler);

      manager.connect().then(() => {
        setTimeout(() => {
          expect(handler).toHaveBeenCalled();
          done();
        }, 10);
      });
    });

    it('should emit disconnection events', async (done) => {
      await manager.connect();

      const handler = vi.fn();
      manager.on('wallet:disconnected', handler);

      await manager.disconnect();

      setTimeout(() => {
        expect(handler).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should restore session', async () => {
      const manager1 = createWalletConnectManager({
        projectId: 'test-id',
        metadata: {
          name: 'Test',
          description: 'Test',
          url: 'https://test.com',
          icons: []
        }
      });

      await manager1.connect();
      const session1 = manager1.getSession();

      // Create new manager with auto-restore
      const manager2 = createWalletConnectManager({
        projectId: 'test-id',
        metadata: {
          name: 'Test',
          description: 'Test',
          url: 'https://test.com',
          icons: []
        },
        autoRestore: true
      });

      const session2 = manager2.getSession();
      expect(session2).toEqual(session1);
    });

    it('should handle connection errors gracefully', async () => {
      const manager = createWalletConnectManager({
        projectId: '',
        metadata: {
          name: 'Test',
          description: 'Test',
          url: 'https://test.com',
          icons: []
        }
      });

      // Should not throw
      try {
        await manager.connect();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Session Management', () => {
    it('should create valid session', async () => {
      const manager = createWalletConnectManager({
        projectId: 'test-id',
        metadata: {
          name: 'Test',
          description: 'Test',
          url: 'https://test.com',
          icons: []
        }
      });

      const session = await manager.connect();

      expect(session.id).toBeDefined();
      expect(session.createdAt).toBeGreaterThan(0);
      expect(session.expiresAt).toBeGreaterThan(session.createdAt);
      expect(session.account).toBeDefined();
    });

    it('should track session expiration', async () => {
      const manager = createWalletConnectManager({
        projectId: 'test-id',
        metadata: {
          name: 'Test',
          description: 'Test',
          url: 'https://test.com',
          icons: []
        }
      });

      const session = await manager.connect();
      expect(session.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('Multi-chain Support', () => {
    it('should support Stacks mainnet', async () => {
      const manager = createWalletConnectManager({
        projectId: 'test-id',
        metadata: {
          name: 'Test',
          description: 'Test',
          url: 'https://test.com',
          icons: []
        },
        chains: ['stacks-mainnet']
      });

      const session = await manager.connect();
      const stacksAccount = session.accounts.find(
        (a) => a.network === 'stacks-mainnet'
      );
      expect(stacksAccount).toBeDefined();
    });

    it('should support multiple networks', async () => {
      const manager = createWalletConnectManager({
        projectId: 'test-id',
        metadata: {
          name: 'Test',
          description: 'Test',
          url: 'https://test.com',
          icons: []
        },
        chains: ['stacks-mainnet', 'ethereum-mainnet', 'bitcoin-mainnet']
      });

      const session = await manager.connect();
      expect(session.accounts.length).toBe(3);

      const networks = session.accounts.map((a) => a.network);
      expect(networks).toContain('stacks-mainnet');
      expect(networks).toContain('ethereum-mainnet');
      expect(networks).toContain('bitcoin-mainnet');
    });
  });
});
