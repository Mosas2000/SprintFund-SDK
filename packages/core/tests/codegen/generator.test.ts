import { describe, it, expect } from 'vitest';
import { parseABI, ClarityABI, ABIParser } from '../../../src/codegen/abi-parser';
import { generateTypes } from '../../../src/codegen/type-generator';
import { generateClient } from '../../../src/codegen/client-generator';

describe('ABI Parser', () => {
  describe('parseABI', () => {
    it('should parse simple read-only function', () => {
      const abi: ClarityABI = {
        functions: [
          {
            name: 'get-balance',
            access: 'read_only',
            args: [
              { name: 'account', type: { type: 'principal' } }
            ],
            outputs: { type: 'uint128' }
          }
        ],
        variables: [],
        maps: []
      };

      const result = parseABI(abi, 'test-contract');

      expect(result.name).toBe('TestContract');
      expect(result.readOnlyFunctions).toHaveLength(1);
      expect(result.readOnlyFunctions[0].name).toBe('getBalance');
      expect(result.readOnlyFunctions[0].clarityName).toBe('get-balance');
      expect(result.readOnlyFunctions[0].args[0].name).toBe('account');
      expect(result.readOnlyFunctions[0].args[0].type.tsType).toBe('Principal');
      expect(result.readOnlyFunctions[0].returnType.tsType).toBe('BigIntString');
    });

    it('should parse public function with multiple args', () => {
      const abi: ClarityABI = {
        functions: [
          {
            name: 'transfer-tokens',
            access: 'public',
            args: [
              { name: 'recipient', type: { type: 'principal' } },
              { name: 'amount', type: { type: 'uint128' } }
            ],
            outputs: {
              type: 'response',
              ok: { type: 'bool' },
              error: { type: 'uint128' }
            }
          }
        ],
        variables: [],
        maps: []
      };

      const result = parseABI(abi, 'token-contract');

      expect(result.publicFunctions).toHaveLength(1);
      expect(result.publicFunctions[0].name).toBe('transferTokens');
      expect(result.publicFunctions[0].args).toHaveLength(2);
      expect(result.publicFunctions[0].returnType.isResponse).toBe(true);
      expect(result.publicFunctions[0].returnType.tsType).toBe('Result<boolean, BigIntString>');
    });

    it('should parse optional type correctly', () => {
      const abi: ClarityABI = {
        functions: [
          {
            name: 'get-metadata',
            access: 'read_only',
            args: [],
            outputs: {
              type: 'optional',
              inner: { type: 'string-utf8', length: 256 }
            }
          }
        ],
        variables: [],
        maps: []
      };

      const result = parseABI(abi, 'test');

      expect(result.readOnlyFunctions[0].returnType.tsType).toBe('string | null');
      expect(result.readOnlyFunctions[0].returnType.isOptional).toBe(true);
    });

    it('should parse tuple type correctly', () => {
      const abi: ClarityABI = {
        functions: [
          {
            name: 'get-user-info',
            access: 'read_only',
            args: [],
            outputs: {
              type: 'tuple',
              fields: [
                { name: 'user-id', type: { type: 'uint128' } },
                { name: 'user-name', type: { type: 'string-utf8', length: 50 } },
                { name: 'is-active', type: { type: 'bool' } }
              ]
            }
          }
        ],
        variables: [],
        maps: []
      };

      const result = parseABI(abi, 'test');

      expect(result.readOnlyFunctions[0].returnType.tsType).toContain('userId');
      expect(result.readOnlyFunctions[0].returnType.tsType).toContain('userName');
      expect(result.readOnlyFunctions[0].returnType.tsType).toContain('isActive');
    });

    it('should parse list type correctly', () => {
      const abi: ClarityABI = {
        functions: [
          {
            name: 'get-participants',
            access: 'read_only',
            args: [],
            outputs: {
              type: 'list',
              inner: { type: 'principal' },
              length: 100
            }
          }
        ],
        variables: [],
        maps: []
      };

      const result = parseABI(abi, 'test');

      expect(result.readOnlyFunctions[0].returnType.tsType).toBe('Principal[]');
    });

    it('should parse constants correctly', () => {
      const abi: ClarityABI = {
        functions: [],
        variables: [
          {
            name: 'contract-owner',
            type: { type: 'principal' },
            access: 'constant'
          },
          {
            name: 'max-supply',
            type: { type: 'uint128' },
            access: 'constant'
          }
        ],
        maps: []
      };

      const result = parseABI(abi, 'test');

      expect(result.constants).toHaveLength(2);
      expect(result.constants[0].name).toBe('CONTRACT_OWNER');
      expect(result.constants[1].name).toBe('MAX_SUPPLY');
    });

    it('should parse data maps correctly', () => {
      const abi: ClarityABI = {
        functions: [],
        variables: [],
        maps: [
          {
            name: 'user-balances',
            key: { type: 'principal' },
            value: { type: 'uint128' }
          }
        ]
      };

      const result = parseABI(abi, 'test');

      expect(result.maps).toHaveLength(1);
      expect(result.maps[0].name).toBe('userBalances');
      expect(result.maps[0].keyType.tsType).toBe('Principal');
      expect(result.maps[0].valueType.tsType).toBe('BigIntString');
    });
  });

  describe('ABIParser type conversion', () => {
    const parser = new ABIParser();

    it('should convert all primitive types', () => {
      const testCases = [
        { input: { type: 'int128' as const }, expected: 'BigIntString' },
        { input: { type: 'uint128' as const }, expected: 'BigIntString' },
        { input: { type: 'bool' as const }, expected: 'boolean' },
        { input: { type: 'principal' as const }, expected: 'Principal' },
        { input: { type: 'string-ascii' as const, length: 100 }, expected: 'string' },
        { input: { type: 'string-utf8' as const, length: 100 }, expected: 'string' },
        { input: { type: 'buffer' as const, length: 32 }, expected: 'Uint8Array' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (parser as any).convertType(input);
        expect(result.tsType).toBe(expected);
      });
    });
  });
});

describe('Type Generator', () => {
  it('should generate valid TypeScript type definitions', () => {
    const abi: ClarityABI = {
      functions: [
        {
          name: 'get-balance',
          access: 'read_only',
          args: [{ name: 'account', type: { type: 'principal' } }],
          outputs: { type: 'uint128' }
        }
      ],
      variables: [],
      maps: []
    };

    const parsed = parseABI(abi, 'test-contract');
    const types = generateTypes(parsed);

    expect(types).toContain('export interface GetBalanceArgs');
    expect(types).toContain('account: Principal');
    expect(types).toContain('export type GetBalanceResult');
    expect(types).toContain('export interface TestContractContract');
    expect(types).toContain('getBalance(args: GetBalanceArgs): Promise<GetBalanceResult>');
  });

  it('should handle functions with no arguments', () => {
    const abi: ClarityABI = {
      functions: [
        {
          name: 'get-total-supply',
          access: 'read_only',
          args: [],
          outputs: { type: 'uint128' }
        }
      ],
      variables: [],
      maps: []
    };

    const parsed = parseABI(abi, 'test');
    const types = generateTypes(parsed);

    expect(types).not.toContain('GetTotalSupplyArgs');
    expect(types).toContain('getTotalSupply(): Promise<GetTotalSupplyResult>');
  });
});

describe('Client Generator', () => {
  it('should generate valid client code', () => {
    const abi: ClarityABI = {
      functions: [
        {
          name: 'get-balance',
          access: 'read_only',
          args: [{ name: 'account', type: { type: 'principal' } }],
          outputs: { type: 'uint128' }
        }
      ],
      variables: [],
      maps: []
    };

    const parsed = parseABI(abi, 'test-contract');
    const client = generateClient(parsed, 'SP000.test-contract');

    expect(client).toContain('export class TestContractClient');
    expect(client).toContain('extends BaseClient');
    expect(client).toContain('implements TestContractContract');
    expect(client).toContain('async getBalance(args: GetBalanceArgs)');
    expect(client).toContain('export function createTestContractClient');
  });

  it('should include contract address in generated code', () => {
    const abi: ClarityABI = {
      functions: [
        {
          name: 'test-func',
          access: 'read_only',
          args: [],
          outputs: { type: 'bool' }
        }
      ],
      variables: [],
      maps: []
    };

    const contractAddress = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3';
    const parsed = parseABI(abi, 'test');
    const client = generateClient(parsed, contractAddress);

    expect(client).toContain(contractAddress);
  });
});
