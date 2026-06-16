import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RiskLevel } from "@/lib/uebaLevels";

export interface RiskScore {
  id: string;
  employee_id: string;
  company_id: string | null;
  score: number;
  level: RiskLevel;
  hst_score: number | null;
  z_score_max: number | null;
  factors: Array<{
    name: string;
    z_score: number;
    weight: number;
    contribution: number;
    current: number;
    baseline_mean: number;
  }>;
  mitre_techniques: string[];
  period: string;
  shadow_mode: boolean;
  alert_triggered: boolean;
  calculated_at: string;
}

export function useRiskScores(employeeId?: string, limit = 30) {
  const [scores, setScores] = useState<RiskScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("user_risk_scores")
        .select("*")
        .order("calculated_at", { ascending: false })
        .limit(limit);
      if (employeeId) q = q.eq("employee_id", employeeId);
      const { data, error: e } = await q;
      if (e) throw e;
      setScores((data as unknown as RiskScore[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load scores"));
    } finally {
      setLoading(false);
    }
  }, [employeeId, limit]);

  useEffect(() => {
    fetchScores();
    const channel = supabase
      .channel(`risk_scores_${employeeId || "all"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_risk_scores" },
        fetchScores
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId, fetchScores]);

  return { scores, loading, error, refresh: fetchScores };
}

export function useLatestRiskScore(employeeId: string) {
  const { scores, loading, error } = useRiskScores(employeeId, 1);
  return { latest: scores[0] || null, loading, error };
}

export function useTopRiskyUsers(limit = 10) {
  const [users, setUsers] = useState<Array<RiskScore & { employee_name?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Latest score per employee — fetch recent and group
        const { data } = await supabase
          .from("user_risk_scores")
          .select("*, employees(name)")
          .order("calculated_at", { ascending: false })
          .limit(500);

        if (!mounted) return;
        const latestByEmp = new Map<string, RiskScore & { employee_name?: string }>();
        for (const row of (data as unknown as Array<
          RiskScore & { employees?: { name: string } }
        >) || []) {
          if (!latestByEmp.has(row.employee_id)) {
            latestByEmp.set(row.employee_id, { ...row, employee_name: row.employees?.name });
          }
        }
        const sorted = Array.from(latestByEmp.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        setUsers(sorted);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { users, loading };
}
