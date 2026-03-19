/**
 * Protocol error types
 */
export var ErrorType;
(function (ErrorType) {
    ErrorType["ContractError"] = "CONTRACT_ERROR";
    ErrorType["NetworkError"] = "NETWORK_ERROR";
    ErrorType["ValidationError"] = "VALIDATION_ERROR";
    ErrorType["NotFoundError"] = "NOT_FOUND_ERROR";
    ErrorType["UnauthorizedError"] = "UNAUTHORIZED_ERROR";
    ErrorType["TimeoutError"] = "TIMEOUT_ERROR";
})(ErrorType || (ErrorType = {}));
//# sourceMappingURL=errors.js.map