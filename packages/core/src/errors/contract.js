import { ContractError } from './base.js';
import { ContractErrorCode } from '../constants/contract.js';
const ERROR_MESSAGES = {
    [ContractErrorCode.ERR_INVALID_PROPOSAL_ID]: 'Proposal ID does not exist or is invalid',
    [ContractErrorCode.ERR_PROPOSAL_INACTIVE]: 'Proposal is not active',
    [ContractErrorCode.ERR_INSUFFICIENT_STAKE]: 'Insufficient stake balance',
    [ContractErrorCode.ERR_INVALID_VOTE_WEIGHT]: 'Vote weight is invalid or exceeds maximum',
    [ContractErrorCode.ERR_DUPLICATE_VOTE]: 'Voter has already voted on this proposal',
    [ContractErrorCode.ERR_PROPOSAL_NOT_ENDED]: 'Proposal voting period has not ended',
    [ContractErrorCode.ERR_UNAUTHORIZED]: 'Action not authorized for this address',
    [ContractErrorCode.ERR_INVALID_PARAMETERS]: 'Invalid parameters provided to contract function',
    [ContractErrorCode.ERR_INSUFFICIENT_FUNDS]: 'Insufficient funds for this operation',
    [ContractErrorCode.ERR_INVALID_ADDRESS]: 'Address is invalid or malformed',
};
const ERROR_REMEDIATIONS = {
    [ContractErrorCode.ERR_INVALID_PROPOSAL_ID]: 'Verify the proposal ID is correct and try again',
    [ContractErrorCode.ERR_PROPOSAL_INACTIVE]: 'Wait until the proposal becomes active or check proposal status',
    [ContractErrorCode.ERR_INSUFFICIENT_STAKE]: 'Stake more tokens in the protocol before voting',
    [ContractErrorCode.ERR_INVALID_VOTE_WEIGHT]: 'Reduce the vote weight or check your voting power limit',
    [ContractErrorCode.ERR_DUPLICATE_VOTE]: 'You have already voted on this proposal',
    [ContractErrorCode.ERR_PROPOSAL_NOT_ENDED]: 'Wait for the proposal voting period to end',
    [ContractErrorCode.ERR_UNAUTHORIZED]: 'Ensure you have the required permissions for this action',
    [ContractErrorCode.ERR_INVALID_PARAMETERS]: 'Check the contract function parameters and try again',
    [ContractErrorCode.ERR_INSUFFICIENT_FUNDS]: 'Ensure you have enough funds for this operation',
    [ContractErrorCode.ERR_INVALID_ADDRESS]: 'Verify the address format and try again',
};
export function getContractErrorMessage(code) {
    return (ERROR_MESSAGES[code] ||
        `Contract error occurred (code: ${code})`);
}
export function getContractErrorRemediation(code) {
    return (ERROR_REMEDIATIONS[code] ||
        'Please try again or contact support');
}
export function throwContractError(code, context) {
    const message = getContractErrorMessage(code);
    const remediation = getContractErrorRemediation(code);
    throw new ContractError(message, code, {
        remediation,
        ...context,
    });
}
//# sourceMappingURL=contract.js.map