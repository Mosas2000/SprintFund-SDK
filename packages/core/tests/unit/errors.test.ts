import { describe, it, expect } from 'vitest';
import {
  ProtocolError,
  ContractError,
  NetworkError,
  ValidationError,
} from '../src/errors/base.js';

describe('Error Classes', () => {
  describe('ProtocolError', () => {
    it('should create error with message', () => {
      const error = new ProtocolError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(1000);
      expect(error.timestamp).toBeDefined();
    });

    it('should include context', () => {
      const context = { field: 'test' };
      const error = new ProtocolError('Test error', 2000, context);
      expect(error.context).toEqual(context);
      expect(error.code).toBe(2000);
    });

    it('should serialize to JSON', () => {
      const error = new ProtocolError('Test error', 1000, { data: 'test' });
      const json = error.toJSON();
      expect(json.message).toBe('Test error');
      expect(json.code).toBe(1000);
      expect(json.context).toEqual({ data: 'test' });
    });
  });

  describe('ContractError', () => {
    it('should have correct name', () => {
      const error = new ContractError('Contract failed', 100);
      expect(error.name).toBe('ContractError');
    });

    it('should preserve code', () => {
      const error = new ContractError('Contract failed', 100, { proposal: 1 });
      expect(error.code).toBe(100);
      expect(error.context.proposal).toBe(1);
    });
  });

  describe('NetworkError', () => {
    it('should have network code', () => {
      const error = new NetworkError('Network timeout');
      expect(error.code).toBe(2000);
    });
  });

  describe('ValidationError', () => {
    it('should have validation code', () => {
      const error = new ValidationError('Invalid input');
      expect(error.code).toBe(3000);
    });
  });
});
