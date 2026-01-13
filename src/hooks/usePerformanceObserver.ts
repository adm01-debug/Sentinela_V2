import { useState, useEffect } from "react";

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
}

export function usePerformanceObserver() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
          setMetrics(m => ({ ...m, fcp: entry.startTime }));
        }
        if (entry.entryType === "largest-contentful-paint") {
          setMetrics(m => ({ ...m, lcp: entry.startTime }));
        }
      });
    });

    observer.observe({ entryTypes: ["paint", "largest-contentful-paint"] });
    return () => observer.disconnect();
  }, []);

  return metrics;
}
