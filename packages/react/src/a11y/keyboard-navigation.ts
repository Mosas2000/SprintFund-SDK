/**
 * Keyboard Navigation Utilities
 * 
 * Helpers for keyboard navigation patterns.
 */

export interface KeyboardNavConfig {
  /**
   * Vertical navigation (up/down arrows)
   */
  vertical?: boolean;

  /**
   * Horizontal navigation (left/right arrows)
   */
  horizontal?: boolean;

  /**
   * Home/End key support
   */
  homeEnd?: boolean;

  /**
   * Wrap around at edges
   */
  wrap?: boolean;
}

export class KeyboardNavigator {
  private config: Required<KeyboardNavConfig>;
  private currentIndex = 0;
  private items: HTMLElement[] = [];

  constructor(config: KeyboardNavConfig = {}) {
    this.config = {
      vertical: config.vertical ?? true,
      horizontal: config.horizontal ?? false,
      homeEnd: config.homeEnd ?? true,
      wrap: config.wrap ?? true
    };
  }

  /**
   * Set items for navigation
   */
  setItems(items: HTMLElement[]): void {
    this.items = items;
    this.currentIndex = 0;
  }

  /**
   * Handle keyboard event
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    let handled = false;

    switch (event.key) {
      case 'ArrowUp':
        if (this.config.vertical) {
          this.movePrevious();
          handled = true;
        }
        break;

      case 'ArrowDown':
        if (this.config.vertical) {
          this.moveNext();
          handled = true;
        }
        break;

      case 'ArrowLeft':
        if (this.config.horizontal) {
          this.movePrevious();
          handled = true;
        }
        break;

      case 'ArrowRight':
        if (this.config.horizontal) {
          this.moveNext();
          handled = true;
        }
        break;

      case 'Home':
        if (this.config.homeEnd) {
          this.moveToFirst();
          handled = true;
        }
        break;

      case 'End':
        if (this.config.homeEnd) {
          this.moveToLast();
          handled = true;
        }
        break;
    }

    if (handled) {
      event.preventDefault();
      this.focusCurrentItem();
    }

    return handled;
  }

  /**
   * Move to next item
   */
  moveNext(): void {
    const nextIndex = this.currentIndex + 1;

    if (nextIndex >= this.items.length) {
      this.currentIndex = this.config.wrap ? 0 : this.items.length - 1;
    } else {
      this.currentIndex = nextIndex;
    }
  }

  /**
   * Move to previous item
   */
  movePrevious(): void {
    const prevIndex = this.currentIndex - 1;

    if (prevIndex < 0) {
      this.currentIndex = this.config.wrap ? this.items.length - 1 : 0;
    } else {
      this.currentIndex = prevIndex;
    }
  }

  /**
   * Move to first item
   */
  moveToFirst(): void {
    this.currentIndex = 0;
  }

  /**
   * Move to last item
   */
  moveToLast(): void {
    this.currentIndex = Math.max(0, this.items.length - 1);
    if (this.items.length === 0) {
      this.currentIndex = 0;
    }
  }

  /**
   * Focus current item
   */
  focusCurrentItem(): void {
    if (this.items[this.currentIndex]) {
      this.items[this.currentIndex].focus();
    }
  }

  /**
   * Get current item
   */
  getCurrentItem(): HTMLElement | undefined {
    return this.items[this.currentIndex];
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Set current index
   */
  setCurrentIndex(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
    }
  }
}

/**
 * Create a keyboard navigator
 */
export function createKeyboardNavigator(config?: KeyboardNavConfig): KeyboardNavigator {
  return new KeyboardNavigator(config);
}
