import { ContractErrorCode } from '../constants/contract.js';
export declare function getContractErrorMessage(code: ContractErrorCode): string;
export declare function getContractErrorRemediation(code: ContractErrorCode): string;
export declare function throwContractError(code: ContractErrorCode, context?: Record<string, unknown>): never;
//# sourceMappingURL=contract.d.ts.map