import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================================
// useInterval - Declarative setInterval
// ============================================================

/**
 * Declarative interval hook that handles cleanup
 * @param callback - Function to call on each interval
 * @param delay - Interval in milliseconds (null to pause)
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
}

// ============================================================
// useTimeout - Declarative setTimeout
// ============================================================

/**
 * Declarative timeout hook that handles cleanup
 * @param callback - Function to call after delay
 * @param delay - Delay in milliseconds (null to disable)
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}

// ============================================================
// useIntervalWhen - Conditional interval
// ============================================================

/**
 * Interval that only runs when condition is true
 */
export function useIntervalWhen(
  callback: () => void,
  delay: number,
  when: boolean
): void {
  useInterval(callback, when ? delay : null);
}

// ============================================================
// useCountdown - Countdown timer
// ============================================================

interface UseCountdownOptions {
  countStart: number;
  intervalMs?: number;
  countStop?: number;
  onComplete?: () => void;
}

interface UseCountdownReturn {
  count: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Countdown timer hook
 */
export function useCountdown(options: UseCountdownOptions): UseCountdownReturn {
  const {
    countStart,
    intervalMs = 1000,
    countStop = 0,
    onComplete,
  } = options;

  const [count, setCount] = useState(countStart);
  const [isRunning, setIsRunning] = useState(false);

  useInterval(
    () => {
      if (count > countStop) {
        setCount((prev) => prev - 1);
      } else {
        setIsRunning(false);
        onComplete?.();
      }
    },
    isRunning ? intervalMs : null
  );

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setCount(countStart);
  }, [countStart]);

  return { count, isRunning, start, stop, reset };
}

// ============================================================
// useCountUp - Count up timer
// ============================================================

interface UseCountUpReturn {
  count: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Count up timer (stopwatch-like)
 */
export function useCountUp(intervalMs = 1000): UseCountUpReturn {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useInterval(
    () => {
      setCount((prev) => prev + 1);
    },
    isRunning ? intervalMs : null
  );

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setCount(0);
  }, []);

  return { count, isRunning, start, stop, reset };
}

// ============================================================
// useStopwatch - Full stopwatch with lap times
// ============================================================

interface UseStopwatchReturn {
  time: number;
  isRunning: boolean;
  laps: number[];
  start: () => void;
  stop: () => void;
  reset: () => void;
  lap: () => void;
  formattedTime: string;
}

/**
 * Full stopwatch with lap functionality
 */
export function useStopwatch(): UseStopwatchReturn {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useInterval(
    () => {
      setTime((prev) => prev + 100);
    },
    isRunning ? 100 : null
  );

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  }, []);
  const lap = useCallback(() => {
    setLaps((prev) => [...prev, time]);
  }, [time]);

  const formattedTime = (() => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const ms = Math.floor((time % 1000) / 100);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${ms}`;
  })();

  return { time, isRunning, laps, start, stop, reset, lap, formattedTime };
}
