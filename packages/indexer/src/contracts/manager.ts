/**
 * Contract Management System
 */

export interface ContractConfig {
  address: string;
  network: string;
  abi?: Record<string, any>;
  metadata?: Record<string, any>;
  enabled: boolean;
}

export class ContractManager {
  private contracts: Map<string, ContractConfig> = new Map();

  registerContract(id: string, config: ContractConfig): void {
    this.contracts.set(id, config);
  }

  getContract(id: string): ContractConfig | undefined {
    return this.contracts.get(id);
  }

  getAllContracts(): ContractConfig[] {
    return Array.from(this.contracts.values());
  }

  enableContract(id: string): void {
    const contract = this.contracts.get(id);
    if (contract) {
      contract.enabled = true;
    }
  }

  disableContract(id: string): void {
    const contract = this.contracts.get(id);
    if (contract) {
      contract.enabled = false;
    }
  }

  getActiveContracts(): ContractConfig[] {
    return Array.from(this.contracts.values()).filter((c) => c.enabled);
  }
}

export function createContractManager(): ContractManager {
  return new ContractManager();
}
