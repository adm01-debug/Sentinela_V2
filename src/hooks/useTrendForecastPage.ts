import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryClient";

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TrendForecast {
  metric: string;
  label: string;
  unit: string;
  direction: "up" | "down" | "stable";
  currentValue: number | null;
  predictedValue: number | null;
  percentChange: number;
  confidence: number;
  timeframe: string;
  dataPoints: TrendPoint[];
}

interface RawForecast {
  metric?: string;
  trend?: string;
  predictedValue?: number;
  currentValue?: number;
  confidence?: number;
  timeframe?: string;
  dataPoints?: TrendPoint[];
}

const METRICS = ["activity", "violations", "productivity"];
const DEFAULT_DAYS = 7;

export const FORECAST_DAY_OPTIONS = [7, 14, 30];

const METRIC_META: Record<string, { label: string; unit: string }> = {
  activity_count: { label: "Atividade monitorada", unit: "registros por dia" },
  violation_count: {
    label: "Violações de política",
    unit: "violações por dia",
  },
  productivity_score: { label: "Produtividade média", unit: "%" },
};

function directionOf(trend?: string): TrendForecast["direction"] {
  if (trend === "increasing") return "up";
  if (trend === "decreasing") return "down";
  return "stable";
}

export function forecastDirectionLabel(direction: TrendForecast["direction"]): string {
  if (direction === "up") return "Subindo";
  if (direction === "down") return "Caindo";
  return "Estável";
}

export function useTrendForecastPage() {
  const [days, setDays] = useState(DEFAULT_DAYS);

  const query = useQuery({
    queryKey: queryKeys.aiInsights.forecasts(days),
    queryFn: async (): Promise<{ forecasts: TrendForecast[]; generatedAt: string | null }> => {
      const { data, error } = await supabase.functions.invoke<{
        forecasts?: RawForecast[];
        metadata?: { generatedAt?: string; forecastDays?: number };
      }>("trend-forecasting", { body: { metrics: METRICS, forecastDays: days } });
      if (error) throw error;

      const forecasts = (data?.forecasts ?? []).map((item) => {
        const metric = item.metric ?? "unknown";
        const meta = METRIC_META[metric];
        const currentValue = item.currentValue ?? null;
        const predictedValue = item.predictedValue ?? null;
        return {
          metric,
          label: meta?.label ?? metric,
          unit: meta?.unit ?? "",
          direction: directionOf(item.trend),
          currentValue,
          predictedValue,
          percentChange:
            currentValue && predictedValue !== null
              ? ((predictedValue - currentValue) / currentValue) * 100
              : 0,
          confidence: item.confidence ?? 0,
          timeframe: item.timeframe ?? `${days} days`,
          dataPoints: item.dataPoints ?? [],
        };
      });

      return { forecasts, generatedAt: data?.metadata?.generatedAt ?? null };
    },
    staleTime: 60_000,
  });

  const forecasts = useMemo(() => query.data?.forecasts ?? [], [query.data]);

  const worseningViolations = useMemo(
    () =>
      forecasts.some(
        (forecast) => forecast.metric === "violation_count" && forecast.direction === "up"
      ),
    [forecasts]
  );

  const handleRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    forecasts,
    days,
    setDays,
    generatedAt: query.data?.generatedAt ?? null,
    worseningViolations,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | null) ?? null,
    isRefreshing: query.isFetching,
    handleRefresh,
  };
}
