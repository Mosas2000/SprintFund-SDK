/**
 * ARIA Live Region Announcer
 * 
 * Manages ARIA live regions for accessible announcements.
 */

export type AriaLiveLevel = 'polite' | 'assertive';

export interface AriaAnnouncerConfig {
  /**
   * Default politeness level
   */
  polite?: AriaLiveLevel;

  /**
   * Clear after delay (ms)
   */
  clearDelay?: number;
}

export class AriaAnnouncer {
  private liveRegions: Map<string, HTMLElement> = new Map();
  private config: Required<AriaAnnouncerConfig>;

  constructor(config: AriaAnnouncerConfig = {}) {
    this.config = {
      polite: config.polite ?? 'polite',
      clearDelay: config.clearDelay ?? 3000
    };
  }

  /**
   * Initialize live regions
   */
  initialize(): void {
    // Polite region
    const politeRegion = this.createLiveRegion('polite', 'polite');
    this.liveRegions.set('polite', politeRegion);

    // Assertive region
    const assertiveRegion = this.createLiveRegion('assertive', 'assertive');
    this.liveRegions.set('assertive', assertiveRegion);

    // Add to DOM
    if (document.body) {
      document.body.appendChild(politeRegion);
      document.body.appendChild(assertiveRegion);
    }
  }

  /**
   * Announce a message
   */
  announce(message: string, level: AriaLiveLevel = this.config.polite): void {
    const region = this.liveRegions.get(level);
    if (!region) {
      console.warn('Live region not initialized:', level);
      return;
    }

    // Clear previous content
    region.textContent = '';

    // Add message
    region.textContent = message;

    // Auto-clear after delay
    setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = '';
      }
    }, this.config.clearDelay);
  }

  /**
   * Announce error (assertive)
   */
  announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  /**
   * Announce success (polite)
   */
  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  /**
   * Announce loading state
   */
  announceLoading(message: string = 'Loading...'): void {
    this.announce(message, 'polite');
  }

  /**
   * Get live region
   */
  getRegion(level: AriaLiveLevel): HTMLElement | undefined {
    return this.liveRegions.get(level);
  }

  /**
   * Clear all regions
   */
  clear(): void {
    for (const region of this.liveRegions.values()) {
      region.textContent = '';
    }
  }

  /**
   * Destroy announcer
   */
  destroy(): void {
    for (const region of this.liveRegions.values()) {
      region.remove();
    }
    this.liveRegions.clear();
  }

  private createLiveRegion(id: string, ariaLive: AriaLiveLevel): HTMLElement {
    const div = document.createElement('div');
    div.id = `aria-live-${id}`;
    div.setAttribute('aria-live', ariaLive);
    div.setAttribute('aria-atomic', 'true');
    div.style.position = 'absolute';
    div.style.left = '-10000px';
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.overflow = 'hidden';
    return div;
  }
}

/**
 * Create an ARIA announcer
 */
export function createAriaAnnouncer(config?: AriaAnnouncerConfig): AriaAnnouncer {
  return new AriaAnnouncer(config);
}

export const ariaAnnouncer = new AriaAnnouncer();
