import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseCountdownOptions {
  autoStart?: boolean;
  interval?: number;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export function useCountdown(initialTime: number, options: UseCountdownOptions = {}) {
  const { autoStart = false, interval = 1000, onComplete, onTick } = options;
  const [remaining, setRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout>();

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setRemaining(newTime ?? initialTime);
    setIsRunning(false);
  }, [initialTime]);

  const restart = useCallback((newTime?: number) => {
    setRemaining(newTime ?? initialTime);
    setIsRunning(true);
  }, [initialTime]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const newValue = prev - interval;
        onTick?.(newValue);
        
        if (newValue <= 0) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return newValue;
      });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, interval, onComplete, onTick]);

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    remaining,
    isRunning,
    isComplete: remaining <= 0,
    formatted: formatTime(remaining),
    start,
    pause,
    reset,
    restart,
  };
}

export default useCountdown;
