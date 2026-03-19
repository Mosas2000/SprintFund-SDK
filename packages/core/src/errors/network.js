import { NetworkError } from './base.js';
export function throwNetworkError(message, context) {
    throw new NetworkError(message, context);
}
export function isNetworkError(error) {
    return error instanceof NetworkError;
}
export class RpcError extends NetworkError {
    constructor(rpcMessage, context) {
        super(`RPC Error: ${rpcMessage}`, context);
        this.rpcMessage = rpcMessage;
        this.name = 'RpcError';
    }
}
export function throwRpcError(message, context) {
    throw new RpcError(message, context);
}
//# sourceMappingURL=network.js.map