/**
 * Base error class for SF Protocol
 */
export class ProtocolError extends Error {
    constructor(message, code = 1000, context = {}) {
        super(message);
        this.name = 'ProtocolError';
        this.code = code;
        this.context = context;
        this.timestamp = Date.now();
        Object.setPrototypeOf(this, ProtocolError.prototype);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
        };
    }
}
export class ContractError extends ProtocolError {
    constructor(message, code, context) {
        super(message, code, context);
        this.name = 'ContractError';
        Object.setPrototypeOf(this, ContractError.prototype);
    }
}
export class NetworkError extends ProtocolError {
    constructor(message, context) {
        super(message, 2000, context);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
export class ValidationError extends ProtocolError {
    constructor(message, context) {
        super(message, 3000, context);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
//# sourceMappingURL=base.js.map