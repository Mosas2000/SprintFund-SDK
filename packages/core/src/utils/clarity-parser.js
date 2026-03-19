import { toBigIntString } from '../types/index.js';
/**
 * Parse Clarity integer responses
 */
export function parseClarityInt(value) {
    // Remove 0u prefix if present
    const cleaned = value.startsWith('u') ? value.slice(1) : value;
    return toBigIntString(cleaned);
}
/**
 * Parse Clarity tuple responses
 */
export function parseClarityTuple(tuple) {
    const result = {};
    for (const [key, value] of Object.entries(tuple)) {
        if (typeof value === 'string' && value.match(/^\d+u?$/)) {
            result[key] = parseClarityInt(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Safe parse Clarity response value
 */
export function parseClarityValue(value) {
    if (typeof value === 'string') {
        if (value.match(/^\d+u?$/)) {
            return parseClarityInt(value);
        }
        return value;
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return parseClarityTuple(value);
    }
    if (Array.isArray(value)) {
        return value.map(parseClarityValue);
    }
    return value;
}
//# sourceMappingURL=clarity-parser.js.map