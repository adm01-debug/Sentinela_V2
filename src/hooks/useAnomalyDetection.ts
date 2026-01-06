import { useState, useEffect, useCallback, useMemo } from 'react';

export interface DataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface Anomaly {
  id: string;
  dataPoint: DataPoint;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  type: 'spike' | 'drop' | 'outlier';
}

export interface UseAnomalyDetectionOptions {
  data: DataPoint[];
  threshold?: number;
  windowSize?: number;
  onAnomalyDetected?: (anomaly: Anomaly) => void;
}

export function useAnomalyDetection(options: UseAnomalyDetectionOptions) {
  const { data, threshold = 2, windowSize = 10, onAnomalyDetected } = options;
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const stats = useMemo(() => {
    if (data.length < 2) return { mean: 0, stdDev: 0 };
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return { mean, stdDev: Math.sqrt(variance) };
  }, [data]);

  const detectAnomalies = useCallback(() => {
    if (data.length < windowSize || stats.stdDev === 0) return [];
    const detected: Anomaly[] = [];
    
    data.forEach((point, i) => {
      const deviation = Math.abs(point.value - stats.mean) / stats.stdDev;
      if (deviation > threshold) {
        const anomaly: Anomaly = {
          id: `anomaly-${i}-${point.timestamp.getTime()}`,
          dataPoint: point,
          deviation,
          severity: deviation > threshold * 2 ? 'high' : deviation > threshold * 1.5 ? 'medium' : 'low',
          type: point.value > stats.mean ? 'spike' : 'drop',
        };
        detected.push(anomaly);
        onAnomalyDetected?.(anomaly);
      }
    });
    return detected;
  }, [data, stats, threshold, windowSize, onAnomalyDetected]);

  useEffect(() => {
    const detected = detectAnomalies();
    setAnomalies(detected);
  }, [detectAnomalies]);

  return { anomalies, stats, hasAnomalies: anomalies.length > 0, highSeverityCount: anomalies.filter(a => a.severity === 'high').length };
}

export default useAnomalyDetection;
