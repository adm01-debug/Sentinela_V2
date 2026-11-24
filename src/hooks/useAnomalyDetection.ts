import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export interface Anomaly {
  id: string;
  type: string;
  severity: AnomalySeverity;
  probability: number;
  description: string;
  affectedEntities: string[];
  suggestedActions: string[];
  timestamp: Date;
}

/** Formato devolvido por `predict-anomaly` (supabase/functions/predict-anomaly). */
interface AnomalyPrediction {
  id: string;
  type: string;
  severity: AnomalySeverity;
  probability: number;
  description: string;
  affectedEntities?: string[];
  suggestedActions?: string[];
  timestamp: string;
}

export interface AnomalyMetadata {
  analyzedRecords: number;
  timeRange: string;
  threshold: number;
  generatedAt: string;
}

export interface UseAnomalyDetectionOptions {
  timeRange?: "24h" | "7d" | "30d";
  threshold?: number;
}

export function useAnomalyDetection(options: UseAnomalyDetectionOptions = {}) {
  const { timeRange = "24h", threshold = 0.7 } = options;
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [metadata, setMetadata] = useState<AnomalyMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const detectAnomalies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("predict-anomaly", {
        body: { timeRange, threshold },
      });
      if (fnError) throw fnError;
      const predictions = (data?.predictions as AnomalyPrediction[] | undefined) ?? [];
      setAnomalies(
        predictions.map((p) => ({
          id: p.id,
          type: p.type,
          severity: p.severity,
          probability: p.probability,
          description: p.description,
          affectedEntities: p.affectedEntities ?? [],
          suggestedActions: p.suggestedActions ?? [],
          timestamp: new Date(p.timestamp),
        }))
      );
      setMetadata((data?.metadata as AnomalyMetadata | undefined) ?? null);
    } catch (e) {
      setAnomalies([]);
      setMetadata(null);
      setError(e instanceof Error ? e : new Error("Falha ao detectar anomalias"));
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, threshold]);

  const dismissAnomaly = useCallback((id: string) => {
    setAnomalies((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const criticalCount = useMemo(
    () => anomalies.filter((a) => a.severity === "critical").length,
    [anomalies]
  );
  const highCount = useMemo(
    () => anomalies.filter((a) => a.severity === "high").length,
    [anomalies]
  );

  return {
    anomalies,
    metadata,
    isLoading,
    error,
    detectAnomalies,
    dismissAnomaly,
    criticalCount,
    highCount,
  };
}

export default useAnomalyDetection;
