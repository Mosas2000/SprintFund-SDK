/**
 * Protocol error types
 */

export enum ErrorType {
  ContractError = 'CONTRACT_ERROR',
  NetworkError = 'NETWORK_ERROR',
  ValidationError = 'VALIDATION_ERROR',
  NotFoundError = 'NOT_FOUND_ERROR',
  UnauthorizedError = 'UNAUTHORIZED_ERROR',
  TimeoutError = 'TIMEOUT_ERROR',
}

export interface ErrorContext {
  type: ErrorType;
  code: number;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface ContractErrorInfo {
  code: number;
  message: string;
  remediation?: string;
}

export interface ValidationErrorInfo {
  field: string;
  message: string;
  value?: unknown;
}
