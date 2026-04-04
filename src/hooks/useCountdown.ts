import { useState, useEffect, useCallback, useRef } from 'react';
export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds((s: number) => s - 1), 1000);
      return () => clearInterval(intervalRef.current);
    }
    if (seconds === 0 && isRunning) { setIsRunning(false); onComplete?.(); }
  }, [isRunning, seconds, onComplete]);
  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((newSeconds?: number) => { setIsRunning(false); setSeconds(newSeconds ?? initialSeconds); }, [initialSeconds]);
  const formatted = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  return { seconds, isRunning, formatted, start, pause, reset, toggle: () => setIsRunning(p => !p) };
}
export default useCountdown;
