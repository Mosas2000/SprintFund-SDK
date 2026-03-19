/**
 * Base type definitions for SF Protocol
 */
/**
 * Helper to create branded BigIntString
 */
export function toBigIntString(value) {
    return String(value);
}
/**
 * Helper to create branded StacksAddress
 */
export function toStacksAddress(value) {
    if (!value.startsWith('SP') && !value.startsWith('SN')) {
        throw new Error('Invalid Stacks address');
    }
    return value;
}
/**
 * Helper to create branded TransactionId
 */
export function toTransactionId(value) {
    if (!/^0x[a-f0-9]{64}$/i.test(value)) {
        throw new Error('Invalid transaction ID');
    }
    return value;
}
/**
 * Helper to create branded Principal
 */
export function toPrincipal(value) {
    if (!value.includes('.') &&
        !value.startsWith('SP') &&
        !value.startsWith('SN')) {
        throw new Error('Invalid principal');
    }
    return value;
}
//# sourceMappingURL=index.js.map