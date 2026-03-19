/**
 * Focus Management for Accessible Components
 * 
 * Handles focus state management for modals, dialogs, and complex components.
 */

export interface FocusManagerConfig {
  /**
   * Trap focus within container
   */
  trap?: boolean;

  /**
   * Restore focus on cleanup
   */
  restoreFocus?: boolean;

  /**
   * Initial focus element selector
   */
  initialFocus?: string;
}

export class FocusManager {
  private previousActiveElement: HTMLElement | null = null;
  private config: Required<FocusManagerConfig>;
  private focusableSelectors =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  constructor(config: FocusManagerConfig = {}) {
    this.config = {
      trap: config.trap ?? false,
      restoreFocus: config.restoreFocus ?? true,
      initialFocus: config.initialFocus || ''
    };
  }

  /**
   * Activate focus management on container
   */
  activate(container: HTMLElement): void {
    // Store current focus
    this.previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Set initial focus
    if (this.config.initialFocus) {
      const initial = container.querySelector(
        this.config.initialFocus
      ) as HTMLElement;
      if (initial) {
        initial.focus();
        return;
      }
    }

    // Focus first focusable element
    const firstFocusable = container.querySelector(
      this.focusableSelectors
    ) as HTMLElement;
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      container.focus();
    }
  }

  /**
   * Trap focus within container
   */
  trapFocus(event: KeyboardEvent, container: HTMLElement): void {
    if (event.key !== 'Tab') return;

    const focusableElements = Array.from(
      container.querySelectorAll(this.focusableSelectors)
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      // Shift+Tab
      if (activeElement === firstElement) {
        event.preventDefault();
        if (lastElement) lastElement.focus();
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        event.preventDefault();
        if (firstElement) firstElement.focus();
      }
    }
  }

  /**
   * Restore previous focus
   */
  restore(): void {
    if (this.config.restoreFocus && this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  /**
   * Get focusable elements
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(this.focusableSelectors)
    ) as HTMLElement[];
  }

  /**
   * Set custom focusable selector
   */
  setFocusableSelector(selector: string): void {
    this.focusableSelectors = selector;
  }
}

/**
 * Create a focus manager
 */
export function createFocusManager(config?: FocusManagerConfig): FocusManager {
  return new FocusManager(config);
}
