import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseIdleDetectionOptions {
  timeout?: number;
  events?: string[];
  onIdle?: () => void;
  onActive?: () => void;
}

export function useIdleDetection(options: UseIdleDetectionOptions = {}) {
  const { 
    timeout = 300000, // 5 minutes default
    events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
    onIdle,
    onActive
  } = options;

  const [isIdle, setIsIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>(null!);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isIdle) {
      setIsIdle(false);
      onActive?.();
    }
    
    setLastActivity(Date.now());
    
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle?.();
    }, timeout);
  }, [timeout, isIdle, onIdle, onActive]);

  useEffect(() => {
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [events, resetTimer]);

  const idleDuration = isIdle ? Date.now() - lastActivity : 0;
  const timeSinceActivity = Date.now() - lastActivity;

  return { isIdle, lastActivity, idleDuration, timeSinceActivity, resetTimer };
}

export default useIdleDetection;
