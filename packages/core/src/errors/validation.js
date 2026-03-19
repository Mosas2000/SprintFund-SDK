import { ValidationError } from './base.js';
export class FieldValidationError extends ValidationError {
    constructor(fields) {
        const fieldMessages = fields.map((f) => `${f.field}: ${f.message}`).join('; ');
        super(`Validation failed: ${fieldMessages}`, {
            fields,
        });
        this.fields = fields;
        this.name = 'FieldValidationError';
    }
}
export function validateAddress(address) {
    if (!address.match(/^(SP|SN)[A-Z0-9]{32}$/)) {
        throw new ValidationError('Invalid Stacks address format', {
            field: 'address',
            value: address,
        });
    }
}
export function validateBigInt(value, fieldName) {
    if (!/^\d+$/.test(value)) {
        throw new ValidationError(`${fieldName} must be a valid number`, {
            field: fieldName,
            value,
        });
    }
}
export function validatePositiveNumber(value, fieldName) {
    if (value <= 0) {
        throw new ValidationError(`${fieldName} must be positive`, {
            field: fieldName,
            value,
        });
    }
}
export function throwValidationError(message, context) {
    throw new ValidationError(message, context);
}
//# sourceMappingURL=validation.js.map