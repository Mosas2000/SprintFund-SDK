/**
 * Contract response decoders
 */

export interface ClarityValue {
  type: string;
  value: any;
}

export type DecoderFn<T> = (value: ClarityValue) => T;

// Primitive decoders
export function decodeUint(value: ClarityValue): bigint {
  if (value.type !== 'uint') {
    throw new Error(`Expected uint, got ${value.type}`);
  }
  return BigInt(value.value);
}

export function decodeInt(value: ClarityValue): bigint {
  if (value.type !== 'int') {
    throw new Error(`Expected int, got ${value.type}`);
  }
  return BigInt(value.value);
}

export function decodeBool(value: ClarityValue): boolean {
  if (value.type !== 'bool') {
    throw new Error(`Expected bool, got ${value.type}`);
  }
  return value.value === true || value.value === 'true';
}

export function decodeString(value: ClarityValue): string {
  if (value.type !== 'string-ascii' && value.type !== 'string-utf8') {
    throw new Error(`Expected string, got ${value.type}`);
  }
  return String(value.value);
}

export function decodePrincipal(value: ClarityValue): string {
  if (value.type !== 'principal') {
    throw new Error(`Expected principal, got ${value.type}`);
  }
  return String(value.value);
}

export function decodeBuffer(value: ClarityValue): Uint8Array {
  if (value.type !== 'buffer') {
    throw new Error(`Expected buffer, got ${value.type}`);
  }
  if (typeof value.value === 'string') {
    const hex = value.value.startsWith('0x') ? value.value.slice(2) : value.value;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }
  return new Uint8Array(value.value);
}

// Optional decoder
export function decodeOptional<T>(
  value: ClarityValue,
  decoder: DecoderFn<T>
): T | null {
  if (value.type === 'none') {
    return null;
  }
  if (value.type === 'some') {
    return decoder(value.value);
  }
  throw new Error(`Expected optional, got ${value.type}`);
}

// List decoder
export function decodeList<T>(
  value: ClarityValue,
  itemDecoder: DecoderFn<T>
): T[] {
  if (value.type !== 'list') {
    throw new Error(`Expected list, got ${value.type}`);
  }
  return (value.value as ClarityValue[]).map(itemDecoder);
}

// Tuple decoder helper
export function decodeTuple<T extends Record<string, any>>(
  value: ClarityValue,
  decoders: { [K in keyof T]: DecoderFn<T[K]> }
): T {
  if (value.type !== 'tuple') {
    throw new Error(`Expected tuple, got ${value.type}`);
  }
  const result: Partial<T> = {};
  for (const key of Object.keys(decoders) as (keyof T)[]) {
    const fieldValue = value.value[key as string];
    if (fieldValue === undefined) {
      throw new Error(`Missing tuple field: ${String(key)}`);
    }
    result[key] = decoders[key](fieldValue);
  }
  return result as T;
}

// Response decoder
export function decodeResponse<T, E>(
  value: ClarityValue,
  okDecoder: DecoderFn<T>,
  errDecoder: DecoderFn<E>
): { ok: true; value: T } | { ok: false; error: E } {
  if (value.type === 'ok') {
    return { ok: true, value: okDecoder(value.value) };
  }
  if (value.type === 'err') {
    return { ok: false, error: errDecoder(value.value) };
  }
  throw new Error(`Expected response, got ${value.type}`);
}

// SprintFund-specific decoders
export interface Proposal {
  id: bigint;
  title: string;
  description: string;
  amount: bigint;
  creator: string;
  votesFor: bigint;
  votesAgainst: bigint;
  status: string;
  createdAt: bigint;
  executedAt: bigint | null;
}

export function decodeProposal(value: ClarityValue): Proposal {
  return decodeTuple(value, {
    id: decodeUint,
    title: decodeString,
    description: decodeString,
    amount: decodeUint,
    creator: decodePrincipal,
    votesFor: decodeUint,
    votesAgainst: decodeUint,
    status: decodeString,
    createdAt: decodeUint,
    executedAt: (v) => decodeOptional(v, decodeUint),
  });
}

export interface StakeInfo {
  amount: bigint;
  stakedAt: bigint;
  votingPower: bigint;
}

export function decodeStakeInfo(value: ClarityValue): StakeInfo {
  return decodeTuple(value, {
    amount: decodeUint,
    stakedAt: decodeUint,
    votingPower: decodeUint,
  });
}

export interface VoteInfo {
  proposalId: bigint;
  voter: string;
  choice: boolean;
  weight: bigint;
  votedAt: bigint;
}

export function decodeVoteInfo(value: ClarityValue): VoteInfo {
  return decodeTuple(value, {
    proposalId: decodeUint,
    voter: decodePrincipal,
    choice: decodeBool,
    weight: decodeUint,
    votedAt: decodeUint,
  });
}

export interface GovernanceConfig {
  proposalThreshold: bigint;
  quorumThreshold: bigint;
  votingPeriod: bigint;
  executionDelay: bigint;
}

export function decodeGovernanceConfig(value: ClarityValue): GovernanceConfig {
  return decodeTuple(value, {
    proposalThreshold: decodeUint,
    quorumThreshold: decodeUint,
    votingPeriod: decodeUint,
    executionDelay: decodeUint,
  });
}
