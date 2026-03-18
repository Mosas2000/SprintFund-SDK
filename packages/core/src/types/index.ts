/**
 * Base type definitions for SF Protocol
 */

/**
 * Represents a bigint value as a string to avoid loss of precision
 */
export type BigIntString = string & { readonly __brand: 'BigIntString' };

/**
 * Represents a Stacks blockchain address
 */
export type StacksAddress = string & { readonly __brand: 'StacksAddress' };

/**
 * Represents a transaction ID on Stacks
 */
export type TransactionId = string & { readonly __brand: 'TransactionId' };

/**
 * Represents a principal on Stacks (either standard or contract principal)
 */
export type Principal = string & { readonly __brand: 'Principal' };

/**
 * Helper to create branded BigIntString
 */
export function toBigIntString(value: string | number | bigint): BigIntString {
  return String(value) as BigIntString;
}

/**
 * Helper to create branded StacksAddress
 */
export function toStacksAddress(value: string): StacksAddress {
  if (!value.startsWith('SP') && !value.startsWith('SN')) {
    throw new Error('Invalid Stacks address');
  }
  return value as StacksAddress;
}

/**
 * Helper to create branded TransactionId
 */
export function toTransactionId(value: string): TransactionId {
  if (!/^0x[a-f0-9]{64}$/i.test(value)) {
    throw new Error('Invalid transaction ID');
  }
  return value as TransactionId;
}

/**
 * Helper to create branded Principal
 */
export function toPrincipal(value: string): Principal {
  if (
    !value.includes('.') &&
    !value.startsWith('SP') &&
    !value.startsWith('SN')
  ) {
    throw new Error('Invalid principal');
  }
  return value as Principal;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
