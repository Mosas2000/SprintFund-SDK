/**
 * Contract principal for SprintFund on Stacks mainnet
 */
export const SPRINTFUND_CONTRACT_PRINCIPAL = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.sprintfund-core-v3';
/**
 * Contract name
 */
export const SPRINTFUND_CONTRACT_NAME = 'sprintfund-core-v3';
/**
 * Contract address
 */
export const SPRINTFUND_CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
/**
 * Error codes from the contract
 */
export var ContractErrorCode;
(function (ContractErrorCode) {
    ContractErrorCode[ContractErrorCode["ERR_INVALID_PROPOSAL_ID"] = 1] = "ERR_INVALID_PROPOSAL_ID";
    ContractErrorCode[ContractErrorCode["ERR_PROPOSAL_INACTIVE"] = 2] = "ERR_PROPOSAL_INACTIVE";
    ContractErrorCode[ContractErrorCode["ERR_INSUFFICIENT_STAKE"] = 3] = "ERR_INSUFFICIENT_STAKE";
    ContractErrorCode[ContractErrorCode["ERR_INVALID_VOTE_WEIGHT"] = 4] = "ERR_INVALID_VOTE_WEIGHT";
    ContractErrorCode[ContractErrorCode["ERR_DUPLICATE_VOTE"] = 5] = "ERR_DUPLICATE_VOTE";
    ContractErrorCode[ContractErrorCode["ERR_PROPOSAL_NOT_ENDED"] = 6] = "ERR_PROPOSAL_NOT_ENDED";
    ContractErrorCode[ContractErrorCode["ERR_UNAUTHORIZED"] = 7] = "ERR_UNAUTHORIZED";
    ContractErrorCode[ContractErrorCode["ERR_INVALID_PARAMETERS"] = 8] = "ERR_INVALID_PARAMETERS";
    ContractErrorCode[ContractErrorCode["ERR_INSUFFICIENT_FUNDS"] = 9] = "ERR_INSUFFICIENT_FUNDS";
    ContractErrorCode[ContractErrorCode["ERR_INVALID_ADDRESS"] = 10] = "ERR_INVALID_ADDRESS";
})(ContractErrorCode || (ContractErrorCode = {}));
/**
 * Proposal status enum
 */
export var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["ACTIVE"] = "ACTIVE";
    ProposalStatus["ENDED"] = "ENDED";
    ProposalStatus["EXECUTED"] = "EXECUTED";
    ProposalStatus["CANCELLED"] = "CANCELLED";
})(ProposalStatus || (ProposalStatus = {}));
/**
 * Vote direction
 */
export var VoteDirection;
(function (VoteDirection) {
    VoteDirection["FOR"] = "FOR";
    VoteDirection["AGAINST"] = "AGAINST";
    VoteDirection["ABSTAIN"] = "ABSTAIN";
})(VoteDirection || (VoteDirection = {}));
//# sourceMappingURL=contract.js.map