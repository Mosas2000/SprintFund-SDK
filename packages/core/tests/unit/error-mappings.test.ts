import { describe, it, expect } from 'vitest';
import {
  getContractErrorMessage,
  getContractErrorRemediation,
  throwContractError,
} from '../src/errors/contract.js';
import { ContractErrorCode } from '../src/constants/contract.js';
import { ContractError } from '../src/errors/base.js';

describe('Error Handling and Mappings', () => {
  describe('Contract error messages', () => {
    it('should provide error message for invalid proposal', () => {
      const msg = getContractErrorMessage(ContractErrorCode.ERR_INVALID_PROPOSAL_ID);
      expect(msg).toContain('Proposal');
    });

    it('should provide error message for insufficient stake', () => {
      const msg = getContractErrorMessage(ContractErrorCode.ERR_INSUFFICIENT_STAKE);
      expect(msg).toContain('Insufficient');
    });

    it('should provide remediation for duplicate vote', () => {
      const remediation = getContractErrorRemediation(
        ContractErrorCode.ERR_DUPLICATE_VOTE
      );
      expect(remediation).toContain('already voted');
    });

    it('should provide remediation for insufficient stake', () => {
      const remediation = getContractErrorRemediation(
        ContractErrorCode.ERR_INSUFFICIENT_STAKE
      );
      expect(remediation).toContain('Stake');
    });
  });

  describe('Error throwing', () => {
    it('should throw contract error with code and context', () => {
      expect(() => {
        throwContractError(ContractErrorCode.ERR_INVALID_PARAMETERS, {
          field: 'amount',
        });
      }).toThrow(ContractError);
    });

    it('should include remediation in thrown error', () => {
      try {
        throwContractError(ContractErrorCode.ERR_INSUFFICIENT_STAKE);
      } catch (error) {
        if (error instanceof ContractError) {
          expect(error.context.remediation).toBeDefined();
        }
      }
    });
  });

  describe('All error codes have messages', () => {
    const allCodes = Object.values(ContractErrorCode).filter(
      (v) => typeof v === 'number'
    ) as number[];

    allCodes.forEach((code) => {
      it(`should have message for error code ${code}`, () => {
        const msg = getContractErrorMessage(code as ContractErrorCode);
        expect(msg).toBeTruthy();
        expect(msg.length).toBeGreaterThan(0);
      });

      it(`should have remediation for error code ${code}`, () => {
        const remediation = getContractErrorRemediation(code as ContractErrorCode);
        expect(remediation).toBeTruthy();
        expect(remediation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error serialization', () => {
    it('should serialize contract error to JSON', () => {
      const error = new ContractError('Test error', 100, { data: 'test' });
      const json = error.toJSON();

      expect(json.message).toBe('Test error');
      expect(json.code).toBe(100);
      expect(json.context.data).toBe('test');
      expect(json.timestamp).toBeDefined();
    });

    it('should preserve error stack for debugging', () => {
      const error = new ContractError('Test error', 100);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ContractError');
    });
  });
});
