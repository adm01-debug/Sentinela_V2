import { useState, useCallback, useMemo } from "react";

interface ProductivityMetric {
  date: string;
  score: number;
  tasksCompleted: number;
  focusTime: number;
}

export function useProductivity() {
  const [metrics, setMetrics] = useState<ProductivityMetric[]>([]);

  const log = useCallback((tasksCompleted: number, focusTime: number) => {
    const metric: ProductivityMetric = {
      date: new Date().toISOString().split("T")[0],
      score: Math.min(100, tasksCompleted * 10 + focusTime / 60),
      tasksCompleted,
      focusTime
    };
    setMetrics(prev => [...prev, metric]);
  }, []);

  const averageScore = useMemo(() => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
  }, [metrics]);

  return { metrics, log, averageScore };
}
