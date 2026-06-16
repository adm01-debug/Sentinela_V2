import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActivitySummary {
  totalActivities: number;
  uniqueUsers: number;
  topApplications: { name: string; count: number; percentage: number }[];
  productivityScore: number;
  peakHours: { hour: number; count: number }[];
  highlights: string[];
}

export interface UseActivitySummaryOptions {
  period?: "day" | "week" | "month";
  employeeId?: string;
}

export function useActivitySummary(options: UseActivitySummaryOptions = {}) {
  const { period = "day", employeeId } = options;
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("summarize-activity", {
        body: { period, employeeId },
      });
      if (fnError) throw fnError;
      setSummary(data?.summary || null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch summary"));
    } finally {
      setIsLoading(false);
    }
  }, [period, employeeId]);

  return { summary, isLoading, error, fetchSummary };
}

export default useActivitySummary;
