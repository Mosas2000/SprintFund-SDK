import { NetworkError } from './base.js';

export function throwNetworkError(
  message: string,
  context?: Record<string, unknown>
): never {
  throw new NetworkError(message, context);
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export class RpcError extends NetworkError {
  public readonly rpcMessage: string;

  constructor(rpcMessage: string, context?: Record<string, unknown>) {
    super(`RPC Error: ${rpcMessage}`, context);
    this.rpcMessage = rpcMessage;
    this.name = 'RpcError';
  }
}

export function throwRpcError(
  message: string,
  context?: Record<string, unknown>
): never {
  throw new RpcError(message, context);
}
