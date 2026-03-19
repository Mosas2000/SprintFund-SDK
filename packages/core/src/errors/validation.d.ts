import { ValidationError } from './base.js';
export interface ValidationErrorField {
    field: string;
    message: string;
    value?: unknown;
}
export declare class FieldValidationError extends ValidationError {
    readonly fields: ValidationErrorField[];
    constructor(fields: ValidationErrorField[]);
}
export declare function validateAddress(address: string): void;
export declare function validateBigInt(value: string, fieldName: string): void;
export declare function validatePositiveNumber(value: number, fieldName: string): void;
export declare function throwValidationError(message: string, context?: Record<string, unknown>): never;
//# sourceMappingURL=validation.d.ts.map