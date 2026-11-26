import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryClient";

export interface RecommendationMetrics {
  [key: string]: string | number | boolean | null;
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description?: string;
  impact?: string;
  effort?: string;
  priority?: number;
  actions?: string[];
  metrics?: RecommendationMetrics;
}

export interface RecommendationsMetadata {
  context?: string;
  generatedAt?: string;
  dataAnalyzed?: { activities?: number; violations?: number; employees?: number };
}

interface RecommendationsQueryResult {
  items: Recommendation[];
  metadata: RecommendationsMetadata | null;
}

const MAX_RECOMMENDATIONS = 20;

// A edge smart-recommendations monta as recomendacoes a partir de keystroke_logs,
// security_violations e employees da empresa de quem chama (escopo aplicado na edge).
const TYPE_LABELS: Record<string, string> = {
  policy: "Políticas",
  productivity: "Produtividade",
  security: "Segurança",
  resource: "Cobertura de monitoramento",
};

const IMPACT_LABELS: Record<string, string> = {
  high: "Impacto alto",
  medium: "Impacto médio",
  low: "Impacto baixo",
};

const EFFORT_LABELS: Record<string, string> = {
  high: "alto",
  medium: "médio",
  low: "baixo",
};

const METRIC_LABELS: Record<string, string> = {
  violationCount: "violações",
  type: "tipo",
  avgProductivity: "produtividade média (%)",
  criticalViolations: "violações críticas",
  highViolations: "violações altas",
  lowActivityCount: "funcionários sem atividade",
  totalEmployees: "funcionários ativos",
};

export function recommendationTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function recommendationImpactLabel(impact?: string): string {
  if (!impact) return "Impacto não informado";
  return IMPACT_LABELS[impact] ?? impact;
}

export function recommendationImpactVariant(
  impact?: string
): "destructive" | "default" | "secondary" {
  if (impact === "high") return "destructive";
  if (impact === "medium") return "default";
  return "secondary";
}

export function recommendationEffortLabel(effort?: string): string {
  if (!effort) return "não estimado";
  return EFFORT_LABELS[effort] ?? effort;
}

export function recommendationMetricLabel(key: string): string {
  return METRIC_LABELS[key] ?? key;
}

export function useSmartRecommendationsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [minPriority, setMinPriority] = useState(0);

  const query = useQuery({
    queryKey: queryKeys.aiInsights.recommendations(MAX_RECOMMENDATIONS),
    queryFn: async (): Promise<RecommendationsQueryResult> => {
      const { data, error } = await supabase.functions.invoke<{
        recommendations?: Recommendation[];
        metadata?: RecommendationsMetadata;
      }>("smart-recommendations", { body: { limit: MAX_RECOMMENDATIONS } });
      if (error) throw error;
      return { items: data?.recommendations ?? [], metadata: data?.metadata ?? null };
    },
    staleTime: 60_000,
  });

  const items = useMemo(() => query.data?.items ?? [], [query.data]);

  const types = useMemo(() => Array.from(new Set(items.map((item) => item.type))).sort(), [items]);

  const recommendations = useMemo(
    () =>
      items
        .filter((item) => typeFilter === "all" || item.type === typeFilter)
        .filter((item) => (item.priority ?? 0) >= minPriority)
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
    [items, minPriority, typeFilter]
  );

  const highPriorityCount = useMemo(
    () => items.filter((item) => (item.priority ?? 0) >= 85).length,
    [items]
  );

  const handleRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    recommendations,
    metadata: query.data?.metadata ?? null,
    types,
    typeFilter,
    minPriority,
    total: items.length,
    highPriorityCount,
    setTypeFilter,
    setMinPriority,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | null) ?? null,
    isRefreshing: query.isFetching,
    handleRefresh,
  };
}
