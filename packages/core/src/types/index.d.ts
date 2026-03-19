/**
 * Base type definitions for SF Protocol
 */
/**
 * Represents a bigint value as a string to avoid loss of precision
 */
export type BigIntString = string & {
    readonly __brand: 'BigIntString';
};
/**
 * Represents a Stacks blockchain address
 */
export type StacksAddress = string & {
    readonly __brand: 'StacksAddress';
};
/**
 * Represents a transaction ID on Stacks
 */
export type TransactionId = string & {
    readonly __brand: 'TransactionId';
};
/**
 * Represents a principal on Stacks (either standard or contract principal)
 */
export type Principal = string & {
    readonly __brand: 'Principal';
};
/**
 * Helper to create branded BigIntString
 */
export declare function toBigIntString(value: string | number | bigint): BigIntString;
/**
 * Helper to create branded StacksAddress
 */
export declare function toStacksAddress(value: string): StacksAddress;
/**
 * Helper to create branded TransactionId
 */
export declare function toTransactionId(value: string): TransactionId;
/**
 * Helper to create branded Principal
 */
export declare function toPrincipal(value: string): Principal;
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map