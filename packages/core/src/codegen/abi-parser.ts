/**
 * ABI Parser for Clarity Smart Contracts
 * 
 * Parses contract ABIs and converts them into an intermediate representation
 * suitable for TypeScript code generation.
 */

export interface ClarityABI {
  functions: ClarityFunction[];
  variables: ClarityVariable[];
  maps: ClarityMap[];
  fungible_tokens?: ClarityToken[];
  non_fungible_tokens?: ClarityToken[];
}

export interface ClarityFunction {
  name: string;
  access: 'public' | 'read_only' | 'private';
  args: ClarityFunctionArg[];
  outputs: ClarityType;
}

export interface ClarityFunctionArg {
  name: string;
  type: ClarityType;
}

export interface ClarityVariable {
  name: string;
  type: ClarityType;
  access: 'constant' | 'variable';
}

export interface ClarityMap {
  name: string;
  key: ClarityType;
  value: ClarityType;
}

export interface ClarityToken {
  name: string;
}

export type ClarityType =
  | { type: 'int128' }
  | { type: 'uint128' }
  | { type: 'bool' }
  | { type: 'principal' }
  | { type: 'string-ascii'; length: number }
  | { type: 'string-utf8'; length: number }
  | { type: 'buffer'; length: number }
  | { type: 'optional'; inner: ClarityType }
  | { type: 'response'; ok: ClarityType; error: ClarityType }
  | { type: 'list'; inner: ClarityType; length: number }
  | { type: 'tuple'; fields: { name: string; type: ClarityType }[] };

export interface ParsedContract {
  name: string;
  readOnlyFunctions: ParsedFunction[];
  publicFunctions: ParsedFunction[];
  constants: ParsedConstant[];
  maps: ParsedMap[];
}

export interface ParsedFunction {
  name: string;
  clarityName: string;
  args: ParsedArg[];
  returnType: TypeScriptType;
  isReadOnly: boolean;
}

export interface ParsedArg {
  name: string;
  clarityName: string;
  type: TypeScriptType;
}

export interface ParsedConstant {
  name: string;
  clarityName: string;
  type: TypeScriptType;
}

export interface ParsedMap {
  name: string;
  clarityName: string;
  keyType: TypeScriptType;
  valueType: TypeScriptType;
}

export interface TypeScriptType {
  tsType: string;
  clarityType: string;
  isOptional: boolean;
  isResponse: boolean;
  needsConversion: boolean;
}

export class ABIParser {
  parse(abi: ClarityABI, contractName: string): ParsedContract {
    const readOnlyFunctions = abi.functions
      .filter(f => f.access === 'read_only')
      .map(f => this.parseFunction(f));

    const publicFunctions = abi.functions
      .filter(f => f.access === 'public')
      .map(f => this.parseFunction(f));

    const constants = abi.variables
      .filter(v => v.access === 'constant')
      .map(v => this.parseConstant(v));

    const maps = abi.maps.map(m => this.parseMap(m));

    return {
      name: this.toPascalCase(contractName),
      readOnlyFunctions,
      publicFunctions,
      constants,
      maps
    };
  }

  private parseFunction(func: ClarityFunction): ParsedFunction {
    return {
      name: this.toCamelCase(func.name),
      clarityName: func.name,
      args: func.args.map(arg => this.parseArg(arg)),
      returnType: this.convertType(func.outputs),
      isReadOnly: func.access === 'read_only'
    };
  }

  private parseArg(arg: ClarityFunctionArg): ParsedArg {
    return {
      name: this.toCamelCase(arg.name),
      clarityName: arg.name,
      type: this.convertType(arg.type)
    };
  }

  private parseConstant(variable: ClarityVariable): ParsedConstant {
    return {
      name: this.toUpperSnakeCase(variable.name),
      clarityName: variable.name,
      type: this.convertType(variable.type)
    };
  }

  private parseMap(map: ClarityMap): ParsedMap {
    return {
      name: this.toCamelCase(map.name),
      clarityName: map.name,
      keyType: this.convertType(map.key),
      valueType: this.convertType(map.value)
    };
  }

  private convertType(clarityType: ClarityType): TypeScriptType {
    switch (clarityType.type) {
      case 'int128':
      case 'uint128':
        return {
          tsType: 'BigIntString',
          clarityType: clarityType.type,
          isOptional: false,
          isResponse: false,
          needsConversion: true
        };

      case 'bool':
        return {
          tsType: 'boolean',
          clarityType: 'bool',
          isOptional: false,
          isResponse: false,
          needsConversion: false
        };

      case 'principal':
        return {
          tsType: 'Principal',
          clarityType: 'principal',
          isOptional: false,
          isResponse: false,
          needsConversion: true
        };

      case 'string-ascii':
      case 'string-utf8':
        return {
          tsType: 'string',
          clarityType: clarityType.type,
          isOptional: false,
          isResponse: false,
          needsConversion: false
        };

      case 'buffer':
        return {
          tsType: 'Uint8Array',
          clarityType: 'buffer',
          isOptional: false,
          isResponse: false,
          needsConversion: true
        };

      case 'optional': {
        const inner = this.convertType(clarityType.inner);
        return {
          ...inner,
          tsType: `${inner.tsType} | null`,
          isOptional: true
        };
      }

      case 'response': {
        const ok = this.convertType(clarityType.ok);
        const err = this.convertType(clarityType.error);
        return {
          tsType: `Result<${ok.tsType}, ${err.tsType}>`,
          clarityType: 'response',
          isOptional: false,
          isResponse: true,
          needsConversion: true
        };
      }

      case 'list': {
        const inner = this.convertType(clarityType.inner);
        return {
          tsType: `${inner.tsType}[]`,
          clarityType: 'list',
          isOptional: false,
          isResponse: false,
          needsConversion: true
        };
      }

      case 'tuple': {
        const fields = clarityType.fields
          .map(f => `${this.toCamelCase(f.name)}: ${this.convertType(f.type).tsType}`)
          .join('; ');
        return {
          tsType: `{ ${fields} }`,
          clarityType: 'tuple',
          isOptional: false,
          isResponse: false,
          needsConversion: true
        };
      }

      default:
        return {
          tsType: 'unknown',
          clarityType: 'unknown',
          isOptional: false,
          isResponse: false,
          needsConversion: true
        };
    }
  }

  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  private toUpperSnakeCase(str: string): string {
    return str.replace(/-/g, '_').toUpperCase();
  }
}

export function parseABI(abi: ClarityABI, contractName: string): ParsedContract {
  const parser = new ABIParser();
  return parser.parse(abi, contractName);
}
