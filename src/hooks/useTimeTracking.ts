import { useState, useCallback, useRef } from "react";

interface TimeEntry { id: string; task: string; start: Date; end?: Date; duration: number; }

export function useTimeTracking() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [active, setActive] = useState<TimeEntry | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const start = useCallback((task) => {
    if (active) return;
    const entry: TimeEntry = { id: crypto.randomUUID(), task, start: new Date(), duration: 0 };
    setActive(entry);
    intervalRef.current = setInterval(() => {
      setActive(a => a ? { ...a, duration: Date.now() - a.start.getTime() } : null);
    }, 1000);
  }, [active]);

  const stop = useCallback(() => {
    if (!active) return;
    clearInterval(intervalRef.current);
    const completed = { ...active, end: new Date() };
    setEntries(prev => [...prev, completed]);
    setActive(null);
    return completed;
  }, [active]);

  const totalTime = entries.reduce((sum, e) => sum + e.duration, 0);

  return { entries, active, start, stop, totalTime };
}
