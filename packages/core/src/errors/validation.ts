import { ValidationError } from './base.js';

export interface ValidationErrorField {
  field: string;
  message: string;
  value?: unknown;
}

export class FieldValidationError extends ValidationError {
  public readonly fields: ValidationErrorField[];

  constructor(fields: ValidationErrorField[]) {
    const fieldMessages = fields.map((f) => `${f.field}: ${f.message}`).join('; ');
    super(`Validation failed: ${fieldMessages}`, {
      fields,
    });
    this.fields = fields;
    this.name = 'FieldValidationError';
  }
}

export function validateAddress(address: string): void {
  if (!address.match(/^(SP|SN)[A-Z0-9]{32}$/)) {
    throw new ValidationError('Invalid Stacks address format', {
      field: 'address',
      value: address,
    });
  }
}

export function validateBigInt(value: string, fieldName: string): void {
  if (!/^\d+$/.test(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`, {
      field: fieldName,
      value,
    });
  }
}

export function validatePositiveNumber(
  value: number,
  fieldName: string
): void {
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be positive`, {
      field: fieldName,
      value,
    });
  }
}

export function throwValidationError(
  message: string,
  context?: Record<string, unknown>
): never {
  throw new ValidationError(message, context);
}
