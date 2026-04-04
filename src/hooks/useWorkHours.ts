import { useState, useCallback, useMemo } from "react";

interface WorkEntry { date: string; hours: number; }

export function useWorkHours() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);

  const log = useCallback((hours: any, date = new Date().toISOString().split("T")[0]) => {
    setEntries(prev => {
      const existing = prev.find(e => e.date === date);
      if (existing) return prev.map(e => e.date === date ? { ...e, hours: e.hours + hours } : e);
      return [...prev, { date, hours }];
    });
  }, []);

  const totalHours = useMemo(() => entries.reduce((sum, e) => sum + e.hours, 0), [entries]);
  const weekHours = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return entries.filter(e => new Date(e.date).getTime() > weekAgo).reduce((sum, e) => sum + e.hours, 0);
  }, [entries]);

  return { entries, log, totalHours, weekHours };
}
