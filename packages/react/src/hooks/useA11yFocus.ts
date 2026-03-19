/**
 * Accessible Focus Hook
 * 
 * React hook for managing focus in accessible components.
 */

import { useEffect, useRef, useState } from 'react';
import { FocusManager } from '../a11y/focus-manager';

export function useA11yFocus(options?: {
  trap?: boolean;
  restoreFocus?: boolean;
  initialFocus?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const focusManagerRef = useRef<FocusManager | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !isActive) return;

    // Create focus manager
    focusManagerRef.current = new FocusManager(options);

    // Activate on mount
    focusManagerRef.current.activate(containerRef.current);

    // Handle focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (options?.trap && focusManagerRef.current) {
        focusManagerRef.current.trapFocus(e, containerRef.current!);
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleKeyDown);
      }
      if (options?.restoreFocus) {
        focusManagerRef.current?.restore();
      }
    };
  }, [isActive, options]);

  return {
    containerRef,
    activate: () => setIsActive(true),
    deactivate: () => setIsActive(false),
    isActive,
    getFocusable: () =>
      focusManagerRef.current?.getFocusableElements(containerRef.current || document.body) || []
  };
}

export default useA11yFocus;
