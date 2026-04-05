/**
 * Validation utilities
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export type Validator<T> = (value: T) => ValidationResult;

// Basic validators
export function required(value: any): ValidationResult {
  const valid = value !== null && value !== undefined && value !== '';
  return { valid, errors: valid ? [] : ['Field is required'] };
}

export function minLength(min: number): Validator<string> {
  return (value) => {
    const valid = value.length >= min;
    return { valid, errors: valid ? [] : [`Minimum length is ${min}`] };
  };
}

export function maxLength(max: number): Validator<string> {
  return (value) => {
    const valid = value.length <= max;
    return { valid, errors: valid ? [] : [`Maximum length is ${max}`] };
  };
}

export function minValue(min: number): Validator<number> {
  return (value) => {
    const valid = value >= min;
    return { valid, errors: valid ? [] : [`Minimum value is ${min}`] };
  };
}

export function maxValue(max: number): Validator<number> {
  return (value) => {
    const valid = value <= max;
    return { valid, errors: valid ? [] : [`Maximum value is ${max}`] };
  };
}

export function pattern(regex: RegExp, message = 'Invalid format'): Validator<string> {
  return (value) => {
    const valid = regex.test(value);
    return { valid, errors: valid ? [] : [message] };
  };
}

export function email(): Validator<string> {
  return pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email');
}

export function url(): Validator<string> {
  return (value) => {
    try {
      new URL(value);
      return { valid: true, errors: [] };
    } catch {
      return { valid: false, errors: ['Invalid URL'] };
    }
  };
}

export function stacksAddress(): Validator<string> {
  return pattern(/^(SP|ST)[0-9A-Z]{39}$/, 'Invalid Stacks address');
}

// Combine validators
export function combine<T>(...validators: Validator<T>[]): Validator<T> {
  return (value) => {
    const errors: string[] = [];
    for (const validator of validators) {
      const result = validator(value);
      errors.push(...result.errors);
    }
    return { valid: errors.length === 0, errors };
  };
}

// Object validator
export function object<T extends Record<string, any>>(
  schema: { [K in keyof T]?: Validator<T[K]> }
): Validator<T> {
  return (value) => {
    const errors: string[] = [];
    for (const [key, validator] of Object.entries(schema)) {
      if (validator) {
        const result = (validator as Validator<any>)(value[key]);
        errors.push(...result.errors.map(e => `${key}: ${e}`));
      }
    }
    return { valid: errors.length === 0, errors };
  };
}

// Array validator
export function array<T>(itemValidator: Validator<T>): Validator<T[]> {
  return (value) => {
    const errors: string[] = [];
    value.forEach((item, i) => {
      const result = itemValidator(item);
      errors.push(...result.errors.map(e => `[${i}]: ${e}`));
    });
    return { valid: errors.length === 0, errors };
  };
}

// Validate function
export function validate<T>(value: T, validator: Validator<T>): ValidationResult {
  return validator(value);
}

// Assert valid
export function assertValid<T>(value: T, validator: Validator<T>): void {
  const result = validator(value);
  if (!result.valid) {
    throw new Error(`Validation failed: ${result.errors.join(', ')}`);
  }
}
