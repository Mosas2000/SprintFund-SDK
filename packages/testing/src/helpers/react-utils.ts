/**
 * React testing utilities
 */

import React from 'react';

// Render result type
export interface RenderResult {
  container: HTMLElement;
  rerender: (element: React.ReactElement) => void;
  unmount: () => void;
  getByTestId: (id: string) => HTMLElement;
  queryByTestId: (id: string) => HTMLElement | null;
  getByRole: (role: string) => HTMLElement;
  queryByRole: (role: string) => HTMLElement | null;
  getByText: (text: string | RegExp) => HTMLElement;
  queryByText: (text: string | RegExp) => HTMLElement | null;
}

// Event simulation
export function fireEvent(element: HTMLElement, event: Event): void {
  element.dispatchEvent(event);
}

fireEvent.click = (element: HTMLElement): void => {
  fireEvent(element, new MouseEvent('click', { bubbles: true, cancelable: true }));
};

fireEvent.change = (element: HTMLElement, value: string): void => {
  if (element instanceof HTMLInputElement) {
    element.value = value;
  }
  fireEvent(element, new Event('change', { bubbles: true }));
};

fireEvent.submit = (element: HTMLElement): void => {
  fireEvent(element, new Event('submit', { bubbles: true, cancelable: true }));
};

fireEvent.keyDown = (element: HTMLElement, key: string): void => {
  fireEvent(element, new KeyboardEvent('keydown', { key, bubbles: true }));
};

fireEvent.keyUp = (element: HTMLElement, key: string): void => {
  fireEvent(element, new KeyboardEvent('keyup', { key, bubbles: true }));
};

fireEvent.focus = (element: HTMLElement): void => {
  element.focus();
  fireEvent(element, new FocusEvent('focus', { bubbles: true }));
};

fireEvent.blur = (element: HTMLElement): void => {
  element.blur();
  fireEvent(element, new FocusEvent('blur', { bubbles: true }));
};

// Wait for async updates
export async function waitForUpdate(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// Mock hook results
export interface MockHookState<T> {
  current: T;
  history: T[];
}

export function createMockHook<T>(initialValue: T): {
  state: MockHookState<T>;
  update: (value: T) => void;
  reset: () => void;
} {
  const state: MockHookState<T> = {
    current: initialValue,
    history: [initialValue],
  };

  return {
    state,
    update: (value: T) => {
      state.current = value;
      state.history.push(value);
    },
    reset: () => {
      state.current = initialValue;
      state.history = [initialValue];
    },
  };
}

// Component wrapper for testing
export function createWrapper(
  providers: React.ComponentType<{ children: React.ReactNode }>[]
): React.ComponentType<{ children: React.ReactNode }> {
  return ({ children }) => {
    return providers.reduceRight(
      (acc, Provider) => React.createElement(Provider, null, acc),
      children as React.ReactElement
    );
  };
}

// Accessibility testing helpers
export function checkA11y(container: HTMLElement): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for missing alt text on images
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt) {
      errors.push(`Image ${index + 1} is missing alt text`);
    }
  });

  // Check for form labels
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    const id = input.id;
    if (id) {
      const label = container.querySelector(`label[for="${id}"]`);
      if (!label) {
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        if (!ariaLabel && !ariaLabelledBy) {
          warnings.push(`Input ${index + 1} (${id}) has no associated label`);
        }
      }
    }
  });

  // Check for heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName[1]);
    if (lastLevel > 0 && level > lastLevel + 1) {
      warnings.push(`Heading level skipped from h${lastLevel} to h${level}`);
    }
    lastLevel = level;
  });

  // Check for button text
  const buttons = container.querySelectorAll('button');
  buttons.forEach((button, index) => {
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      errors.push(`Button ${index + 1} has no accessible text`);
    }
  });

  return { errors, warnings };
}

// Props spy for component testing
export class PropsSpy<T extends Record<string, any>> {
  private calls: T[] = [];

  capture = (props: T): void => {
    this.calls.push({ ...props });
  };

  getLastProps(): T | undefined {
    return this.calls[this.calls.length - 1];
  }

  getAllProps(): T[] {
    return [...this.calls];
  }

  getCallCount(): number {
    return this.calls.length;
  }

  clear(): void {
    this.calls = [];
  }

  wasCalledWith(matcher: Partial<T>): boolean {
    return this.calls.some((call) =>
      Object.entries(matcher).every(([key, value]) => call[key] === value)
    );
  }
}

// Component state tracker
export class StateTracker<S> {
  private states: S[] = [];

  push(state: S): void {
    this.states.push(state);
  }

  getHistory(): S[] {
    return [...this.states];
  }

  getLatest(): S | undefined {
    return this.states[this.states.length - 1];
  }

  getTransitions(): { from: S; to: S }[] {
    const transitions: { from: S; to: S }[] = [];
    for (let i = 1; i < this.states.length; i++) {
      transitions.push({ from: this.states[i - 1], to: this.states[i] });
    }
    return transitions;
  }

  clear(): void {
    this.states = [];
  }
}
