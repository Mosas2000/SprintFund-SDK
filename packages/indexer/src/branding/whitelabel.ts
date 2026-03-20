/**
 * White-label Branding System
 */

export interface BrandingConfig {
  name: string;
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  customDomain?: string;
  metadata?: Record<string, any>;
}

export class BrandingManager {
  private brands: Map<string, BrandingConfig> = new Map();

  registerBrand(id: string, config: BrandingConfig): void {
    this.brands.set(id, config);
  }

  getBrand(id: string): BrandingConfig | undefined {
    return this.brands.get(id);
  }

  getBrandByDomain(domain: string): BrandingConfig | undefined {
    for (const brand of this.brands.values()) {
      if (brand.customDomain === domain) {
        return brand;
      }
    }
    return undefined;
  }

  getAllBrands(): BrandingConfig[] {
    return Array.from(this.brands.values());
  }

  updateBrand(id: string, config: Partial<BrandingConfig>): void {
    const brand = this.brands.get(id);
    if (brand) {
      Object.assign(brand, config);
    }
  }
}

export function createBrandingManager(): BrandingManager {
  return new BrandingManager();
}
