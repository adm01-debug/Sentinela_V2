import { useState, useRef, useCallback } from "react";

export function useTimer(initialTime = 0) {
  const [time, setTime] = useState(initialTime);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>(null!);

  const start = useCallback(() => {
    if (running || time <= 0) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 0) { clearInterval(intervalRef.current); setRunning(false); return 0; }
        return t - 1000;
      });
    }, 1000);
  }, [running, time]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback((newTime = initialTime) => {
    stop();
    setTime(newTime);
  }, [stop, initialTime]);

  return { time, running, start, stop, reset };
}
