/**
 * ARIA Live Hook
 * 
 * React hook for accessible announcements via live regions.
 */

import { useEffect, useRef } from 'react';
import { AriaAnnouncer, AriaLiveLevel } from '../a11y/aria-announcer';

export function useAriaLive() {
  const announcerRef = useRef<AriaAnnouncer | null>(null);

  useEffect(() => {
    // Initialize announcer
    announcerRef.current = new AriaAnnouncer();
    announcerRef.current.initialize();

    // Cleanup
    return () => {
      announcerRef.current?.destroy();
    };
  }, []);

  return {
    announce: (message: string, level?: AriaLiveLevel) => {
      announcerRef.current?.announce(message, level);
    },
    announceError: (message: string) => {
      announcerRef.current?.announceError(message);
    },
    announceSuccess: (message: string) => {
      announcerRef.current?.announceSuccess(message);
    },
    announceLoading: (message?: string) => {
      announcerRef.current?.announceLoading(message);
    }
  };
}

export default useAriaLive;
