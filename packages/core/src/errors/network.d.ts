import { NetworkError } from './base.js';
export declare function throwNetworkError(message: string, context?: Record<string, unknown>): never;
export declare function isNetworkError(error: unknown): error is NetworkError;
export declare class RpcError extends NetworkError {
    readonly rpcMessage: string;
    constructor(rpcMessage: string, context?: Record<string, unknown>);
}
export declare function throwRpcError(message: string, context?: Record<string, unknown>): never;
//# sourceMappingURL=network.d.ts.map