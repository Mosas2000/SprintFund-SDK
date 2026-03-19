/**
 * Type guards for runtime type checking
 */
export function isPrincipal(value) {
    if (typeof value !== 'string')
        return false;
    return /^(SP|SN)[A-Z0-9]{32}(\.[a-z0-9-]+)?$/.test(value);
}
export function isBigIntString(value) {
    if (typeof value !== 'string')
        return false;
    return /^\d+$/.test(value);
}
export function isStacksAddress(value) {
    if (typeof value !== 'string')
        return false;
    return /^(SP|SN)[A-Z0-9]{32}$/.test(value);
}
export function isProposal(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const obj = value;
    return (isBigIntString(obj.id) &&
        typeof obj.title === 'string' &&
        typeof obj.description === 'string' &&
        isPrincipal(obj.proposer) &&
        typeof obj.createdAt === 'number' &&
        typeof obj.endsAt === 'number' &&
        isBigIntString(obj.fundingGoal) &&
        isBigIntString(obj.fundingRaised) &&
        typeof obj.status === 'string');
}
export function isVote(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const obj = value;
    return (isBigIntString(obj.proposalId) &&
        isPrincipal(obj.voter) &&
        typeof obj.direction === 'string' &&
        isBigIntString(obj.weight) &&
        typeof obj.votedAt === 'number' &&
        typeof obj.blockHeight === 'number');
}
export function isStakeBalance(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const obj = value;
    return (isPrincipal(obj.holder) &&
        isBigIntString(obj.balance) &&
        typeof obj.stakedAt === 'number' &&
        typeof obj.blockHeight === 'number');
}
//# sourceMappingURL=contract.js.map