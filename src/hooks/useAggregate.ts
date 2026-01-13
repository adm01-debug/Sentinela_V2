import { useMemo } from "react";

type AggregateFunction = "sum" | "avg" | "min" | "max" | "count";

export function useAggregate<T extends Record<string, number>>(
  data: T[],
  field: keyof T,
  fn: AggregateFunction
) {
  return useMemo(() => {
    if (data.length === 0) return 0;
    
    const values = data.map(item => item[field]);
    
    switch (fn) {
      case "sum": return values.reduce((a, b) => a + b, 0);
      case "avg": return values.reduce((a, b) => a + b, 0) / values.length;
      case "min": return Math.min(...values);
      case "max": return Math.max(...values);
      case "count": return values.length;
    }
  }, [data, field, fn]);
}
