/**
 * Post-condition builders for transaction safety
 */

export type PostConditionMode = 'allow' | 'deny';

export interface PostCondition {
  type: string;
  principal: string;
  [key: string]: any;
}

export interface STXPostCondition extends PostCondition {
  type: 'stx';
  amount: bigint;
  condition: 'eq' | 'gte' | 'gt' | 'lte' | 'lt';
}

export interface FungiblePostCondition extends PostCondition {
  type: 'fungible';
  asset: { address: string; name: string };
  amount: bigint;
  condition: 'eq' | 'gte' | 'gt' | 'lte' | 'lt';
}

export interface NonFungiblePostCondition extends PostCondition {
  type: 'non-fungible';
  asset: { address: string; name: string };
  assetId: any;
  condition: 'sent' | 'not-sent';
}

// STX post-condition builders
export function stxTransferExact(
  principal: string,
  amount: bigint
): STXPostCondition {
  return { type: 'stx', principal, amount, condition: 'eq' };
}

export function stxTransferGte(
  principal: string,
  amount: bigint
): STXPostCondition {
  return { type: 'stx', principal, amount, condition: 'gte' };
}

export function stxTransferLte(
  principal: string,
  amount: bigint
): STXPostCondition {
  return { type: 'stx', principal, amount, condition: 'lte' };
}

// Fungible token post-condition builders
export function ftTransferExact(
  principal: string,
  contractAddress: string,
  assetName: string,
  amount: bigint
): FungiblePostCondition {
  return {
    type: 'fungible',
    principal,
    asset: { address: contractAddress, name: assetName },
    amount,
    condition: 'eq',
  };
}

export function ftTransferGte(
  principal: string,
  contractAddress: string,
  assetName: string,
  amount: bigint
): FungiblePostCondition {
  return {
    type: 'fungible',
    principal,
    asset: { address: contractAddress, name: assetName },
    amount,
    condition: 'gte',
  };
}

export function ftTransferLte(
  principal: string,
  contractAddress: string,
  assetName: string,
  amount: bigint
): FungiblePostCondition {
  return {
    type: 'fungible',
    principal,
    asset: { address: contractAddress, name: assetName },
    amount,
    condition: 'lte',
  };
}

// Non-fungible post-condition builders
export function nftSent(
  principal: string,
  contractAddress: string,
  assetName: string,
  assetId: any
): NonFungiblePostCondition {
  return {
    type: 'non-fungible',
    principal,
    asset: { address: contractAddress, name: assetName },
    assetId,
    condition: 'sent',
  };
}

export function nftNotSent(
  principal: string,
  contractAddress: string,
  assetName: string,
  assetId: any
): NonFungiblePostCondition {
  return {
    type: 'non-fungible',
    principal,
    asset: { address: contractAddress, name: assetName },
    assetId,
    condition: 'not-sent',
  };
}

// Builder class for composing multiple post-conditions
export class PostConditionBuilder {
  private conditions: PostCondition[] = [];
  private mode: PostConditionMode = 'deny';

  allowMode(): this {
    this.mode = 'allow';
    return this;
  }

  denyMode(): this {
    this.mode = 'deny';
    return this;
  }

  stxExact(principal: string, amount: bigint): this {
    this.conditions.push(stxTransferExact(principal, amount));
    return this;
  }

  stxAtLeast(principal: string, amount: bigint): this {
    this.conditions.push(stxTransferGte(principal, amount));
    return this;
  }

  stxAtMost(principal: string, amount: bigint): this {
    this.conditions.push(stxTransferLte(principal, amount));
    return this;
  }

  ftExact(
    principal: string,
    contractAddress: string,
    assetName: string,
    amount: bigint
  ): this {
    this.conditions.push(ftTransferExact(principal, contractAddress, assetName, amount));
    return this;
  }

  nftSent(
    principal: string,
    contractAddress: string,
    assetName: string,
    assetId: any
  ): this {
    this.conditions.push(nftSent(principal, contractAddress, assetName, assetId));
    return this;
  }

  build(): { mode: PostConditionMode; conditions: PostCondition[] } {
    return {
      mode: this.mode,
      conditions: [...this.conditions],
    };
  }
}

export function createPostConditions(): PostConditionBuilder {
  return new PostConditionBuilder();
}
