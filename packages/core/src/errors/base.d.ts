/**
 * Base error class for SF Protocol
 */
export declare class ProtocolError extends Error {
    readonly code: number;
    readonly context: Record<string, unknown>;
    readonly timestamp: number;
    constructor(message: string, code?: number, context?: Record<string, unknown>);
    toJSON(): Record<string, unknown>;
}
export declare class ContractError extends ProtocolError {
    constructor(message: string, code: number, context?: Record<string, unknown>);
}
export declare class NetworkError extends ProtocolError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class ValidationError extends ProtocolError {
    constructor(message: string, context?: Record<string, unknown>);
}
//# sourceMappingURL=base.d.ts.map