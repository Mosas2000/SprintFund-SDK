import { BigIntString } from '../types/index.js';
/**
 * Parse Clarity integer responses
 */
export declare function parseClarityInt(value: string): BigIntString;
/**
 * Parse Clarity tuple responses
 */
export declare function parseClarityTuple(tuple: Record<string, unknown>): Record<string, unknown>;
/**
 * Safe parse Clarity response value
 */
export declare function parseClarityValue(value: unknown): unknown;
//# sourceMappingURL=clarity-parser.d.ts.map