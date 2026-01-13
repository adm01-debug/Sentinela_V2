import { useMemo } from "react";

export function useSummarize<T extends Record<string, number>>(
  data: T[],
  fields: (keyof T)[]
) {
  return useMemo(() => {
    const summary: Record<string, { sum: number; avg: number; min: number; max: number }> = {};
    
    fields.forEach(field => {
      const values = data.map(d => d[field]);
      summary[field as string] = {
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    });
    
    return summary;
  }, [data, fields]);
}
