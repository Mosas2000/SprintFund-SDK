/**
 * Base error class for SF Protocol
 */
export class ProtocolError extends Error {
  public readonly code: number;
  public readonly context: Record<string, unknown>;
  public readonly timestamp: number;

  constructor(
    message: string,
    code: number = 1000,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'ProtocolError';
    this.code = code;
    this.context = context;
    this.timestamp = Date.now();
    Object.setPrototypeOf(this, ProtocolError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

export class ContractError extends ProtocolError {
  constructor(
    message: string,
    code: number,
    context?: Record<string, unknown>
  ) {
    super(message, code, context);
    this.name = 'ContractError';
    Object.setPrototypeOf(this, ContractError.prototype);
  }
}

export class NetworkError extends ProtocolError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 2000, context);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ValidationError extends ProtocolError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 3000, context);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
