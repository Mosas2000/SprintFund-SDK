import { describe, it, expect } from 'vitest';
import {
  validateVoteParameters,
  validateProposalParameters,
  validateStakeTransaction,
  estimateTotalVotingCost,
} from '../src/math/validators.js';
import { ValidationError } from '../src/errors/validation.js';
import { toBigIntString } from '../src/types/index.js';

describe('Math Validators', () => {
  describe('validateVoteParameters', () => {
    it('should accept valid parameters', () => {
      expect(() => {
        validateVoteParameters(toBigIntString(5), toBigIntString(100));
      }).not.toThrow();
    });

    it('should reject zero weight', () => {
      expect(() => {
        validateVoteParameters(toBigIntString(0), toBigIntString(100));
      }).toThrow(ValidationError);
    });

    it('should reject negative weight', () => {
      expect(() => {
        validateVoteParameters(toBigIntString(-5), toBigIntString(100));
      }).toThrow(ValidationError);
    });

    it('should reject weight exceeding max', () => {
      expect(() => {
        validateVoteParameters(toBigIntString(50), toBigIntString(100));
      }).toThrow(ValidationError);
    });

    it('should reject zero stake', () => {
      expect(() => {
        validateVoteParameters(toBigIntString(5), toBigIntString(0));
      }).toThrow(ValidationError);
    });
  });

  describe('validateProposalParameters', () => {
    it('should accept valid parameters', () => {
      expect(() => {
        validateProposalParameters(toBigIntString(1000000), 1000);
      }).not.toThrow();
    });

    it('should reject zero goal', () => {
      expect(() => {
        validateProposalParameters(toBigIntString(0), 1000);
      }).toThrow(ValidationError);
    });

    it('should reject zero duration', () => {
      expect(() => {
        validateProposalParameters(toBigIntString(1000000), 0);
      }).toThrow(ValidationError);
    });

    it('should reject excessive duration', () => {
      expect(() => {
        validateProposalParameters(toBigIntString(1000000), 200000);
      }).toThrow(ValidationError);
    });
  });

  describe('validateStakeTransaction', () => {
    it('should accept valid stake', () => {
      expect(() => {
        validateStakeTransaction(toBigIntString(10000000));
      }).not.toThrow();
    });

    it('should reject zero amount', () => {
      expect(() => {
        validateStakeTransaction(toBigIntString(0));
      }).toThrow(ValidationError);
    });

    it('should reject below minimum', () => {
      expect(() => {
        validateStakeTransaction(toBigIntString(100));
      }).toThrow(ValidationError);
    });
  });

  describe('estimateTotalVotingCost', () => {
    it('should sum vote costs', () => {
      const votes = [toBigIntString(2), toBigIntString(3)];
      const total = estimateTotalVotingCost(votes);
      // 2^2 + 3^2 = 4 + 9 = 13
      expect(total).toBe('13');
    });

    it('should handle empty votes', () => {
      const total = estimateTotalVotingCost([]);
      expect(total).toBe('0');
    });

    it('should handle single vote', () => {
      const votes = [toBigIntString(5)];
      const total = estimateTotalVotingCost(votes);
      expect(total).toBe('25');
    });
  });
});
