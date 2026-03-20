/**
 * Advanced data serialization and validation framework
 */

export type Codec<T> = {
  encode: (value: T) => string | number | boolean | Record<string, any> | any[];
  decode: (value: any) => T;
};

/**
 * Standard codecs for common types
 */
export const StandardCodecs = {
  string: {
    encode: (v: string) => v,
    decode: (v: any) => String(v),
  } as Codec<string>,

  number: {
    encode: (v: number) => v,
    decode: (v: any) => Number(v),
  } as Codec<number>,

  boolean: {
    encode: (v: boolean) => v,
    decode: (v: any) => Boolean(v),
  } as Codec<boolean>,

  bigint: {
    encode: (v: bigint) => v.toString(),
    decode: (v: any) => BigInt(String(v)),
  } as Codec<bigint>,

  date: {
    encode: (v: Date) => v.toISOString(),
    decode: (v: any) => new Date(String(v)),
  } as Codec<Date>,

  buffer: {
    encode: (v: Buffer) => v.toString('base64'),
    decode: (v: any) => Buffer.from(String(v), 'base64'),
  } as Codec<Buffer>,

  array: <T>(codec: Codec<T>): Codec<T[]> => ({
    encode: (v: T[]) => v.map(item => codec.encode(item)),
    decode: (v: any) => Array.isArray(v) ? v.map(item => codec.decode(item)) : [],
  }),

  record: <T>(codec: Codec<T>): Codec<Record<string, T>> => ({
    encode: (v: Record<string, T>) =>
      Object.entries(v).reduce((acc, [k, val]) => ({ ...acc, [k]: codec.encode(val) }), {}),
    decode: (v: any) =>
      Object.entries(v ?? {}).reduce((acc, [k, val]) => ({ ...acc, [k]: codec.decode(val) }), {}),
  }),

  optional: <T>(codec: Codec<T>): Codec<T | undefined> => ({
    encode: (v: T | undefined) => v === undefined ? null : codec.encode(v),
    decode: (v: any) => v === null || v === undefined ? undefined : codec.decode(v),
  }),

  union: <T extends Record<string, any>>(codecs: { [K in keyof T]: Codec<T[K]> }): Codec<T> => ({
    encode: (v: T) => v,
    decode: (v: any) => v,
  }),
};

/**
 * Schema validator
 */
export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

export class SchemaValidator {
  private rules: Map<string, (value: any) => ValidationError[]> = new Map();

  addRule(path: string, validator: (value: any) => ValidationError[]): void {
    this.rules.set(path, validator);
  }

  validate(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [path, validator] of this.rules) {
      const value = this.getNestedValue(data, path);
      errors.push(...validator(value));
    }

    return errors;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

/**
 * Builders for common validators
 */
export const Validators = {
  required: (path: string, value: any): ValidationError[] => {
    if (value === null || value === undefined || value === '') {
      return [{ path, message: 'Field is required', value }];
    }
    return [];
  },

  string: (path: string, value: any): ValidationError[] => {
    if (value !== undefined && typeof value !== 'string') {
      return [{ path, message: 'Must be a string', value }];
    }
    return [];
  },

  number: (path: string, value: any): ValidationError[] => {
    if (value !== undefined && typeof value !== 'number') {
      return [{ path, message: 'Must be a number', value }];
    }
    return [];
  },

  integer: (path: string, value: any): ValidationError[] => {
    if (value !== undefined && (!Number.isInteger(value))) {
      return [{ path, message: 'Must be an integer', value }];
    }
    return [];
  },

  positive: (path: string, value: any): ValidationError[] => {
    if (value !== undefined && typeof value === 'number' && value <= 0) {
      return [{ path, message: 'Must be positive', value }];
    }
    return [];
  },

  minLength: (path: string, min: number, value: any): ValidationError[] => {
    if (value !== undefined && String(value).length < min) {
      return [{ path, message: `Minimum length is ${min}`, value }];
    }
    return [];
  },

  maxLength: (path: string, max: number, value: any): ValidationError[] => {
    if (value !== undefined && String(value).length > max) {
      return [{ path, message: `Maximum length is ${max}`, value }];
    }
    return [];
  },

  pattern: (path: string, pattern: RegExp, value: any): ValidationError[] => {
    if (value !== undefined && !pattern.test(String(value))) {
      return [{ path, message: `Must match pattern ${pattern}`, value }];
    }
    return [];
  },

  enum: (path: string, allowed: any[], value: any): ValidationError[] => {
    if (value !== undefined && !allowed.includes(value)) {
      return [{ path, message: `Must be one of ${allowed.join(', ')}`, value }];
    }
    return [];
  },

  array: (path: string, value: any): ValidationError[] => {
    if (value !== undefined && !Array.isArray(value)) {
      return [{ path, message: 'Must be an array', value }];
    }
    return [];
  },

  email: (path: string, value: any): ValidationError[] => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value !== undefined && !emailRegex.test(String(value))) {
      return [{ path, message: 'Must be a valid email', value }];
    }
    return [];
  },

  url: (path: string, value: any): ValidationError[] => {
    try {
      if (value !== undefined) new URL(String(value));
      return [];
    } catch {
      return [{ path, message: 'Must be a valid URL', value }];
    }
  },
};

/**
 * JSON serializer with type safety
 */
export class TypedSerializer<T> {
  constructor(private codec: Codec<T>) {}

  serialize(value: T): string {
    const encoded = this.codec.encode(value);
    return JSON.stringify(encoded);
  }

  deserialize(json: string): T {
    const decoded = JSON.parse(json);
    return this.codec.decode(decoded);
  }

  encodeObject(value: T): Record<string, any> {
    return this.codec.encode(value) as Record<string, any>;
  }

  decodeObject(obj: Record<string, any>): T {
    return this.codec.decode(obj);
  }
}

/**
 * Schema builder for fluent validation
 */
export class SchemaBuilder {
  private validator = new SchemaValidator();

  required(field: string): this {
    const current = this.validator['rules'].get(field) ?? (() => []);
    this.validator['rules'].set(field, (value: any) => [
      ...current(value),
      ...Validators.required(field, value),
    ]);
    return this;
  }

  string(field: string): this {
    const current = this.validator['rules'].get(field) ?? (() => []);
    this.validator['rules'].set(field, (value: any) => [
      ...current(value),
      ...Validators.string(field, value),
    ]);
    return this;
  }

  number(field: string): this {
    const current = this.validator['rules'].get(field) ?? (() => []);
    this.validator['rules'].set(field, (value: any) => [
      ...current(value),
      ...Validators.number(field, value),
    ]);
    return this;
  }

  email(field: string): this {
    const current = this.validator['rules'].get(field) ?? (() => []);
    this.validator['rules'].set(field, (value: any) => [
      ...current(value),
      ...Validators.email(field, value),
    ]);
    return this;
  }

  minLength(field: string, min: number): this {
    const current = this.validator['rules'].get(field) ?? (() => []);
    this.validator['rules'].set(field, (value: any) => [
      ...current(value),
      ...Validators.minLength(field, min, value),
    ]);
    return this;
  }

  validate(data: any): ValidationError[] {
    return this.validator.validate(data);
  }

  build(): SchemaValidator {
    return this.validator;
  }
}

export function createSchema(): SchemaBuilder {
  return new SchemaBuilder();
}

export function createSerializer<T>(codec: Codec<T>): TypedSerializer<T> {
  return new TypedSerializer(codec);
}
