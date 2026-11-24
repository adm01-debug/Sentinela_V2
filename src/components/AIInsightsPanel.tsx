import { useEffect } from "react";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIInsights, type AIInsightType } from "@/hooks/useAIInsights";

const INSIGHT_TYPES: AIInsightType[] = ["trend", "anomaly", "recommendation"];

const TYPE_LABEL: Record<AIInsightType, string> = {
  trend: "Tendência",
  anomaly: "Anomalia",
  recommendation: "Recomendação",
  prediction: "Previsão",
};

const SEVERITY_LABEL: Record<"low" | "medium" | "high", string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const SEVERITY_VARIANT: Record<"low" | "medium" | "high", "outline" | "secondary" | "warning"> = {
  low: "outline",
  medium: "secondary",
  high: "warning",
};

export const AIInsightsPanel = () => {
  const { insights, metadata, isLoading, error, fetchInsights, dismissInsight } = useAIInsights({
    insightTypes: INSIGHT_TYPES,
  });

  useEffect(() => {
    void fetchInsights();
  }, [fetchInsights]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="text-warning h-4 w-4" />
          Insights da IA
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchInsights()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Gerar insights
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="border-destructive/40 bg-destructive/5 flex items-center justify-between gap-3 rounded-lg border p-3">
            <p className="text-destructive text-sm">
              Não foi possível gerar os insights: {error.message}
            </p>
            <Button variant="outline" size="sm" onClick={() => void fetchInsights()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!error && isLoading && insights.length === 0 && (
          <div className="text-muted-foreground flex items-center gap-2 p-3 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analisando o histórico para gerar insights...
          </div>
        )}

        {!error && !isLoading && insights.length === 0 && (
          <p className="text-muted-foreground p-3 text-sm">
            Nenhum insight no período — {metadata?.analyzedActivities ?? 0} atividade(s) e{" "}
            {metadata?.analyzedEmployees ?? 0} funcionário(s) analisado(s).
          </p>
        )}

        {insights.length > 0 && (
          <ul className="space-y-3" data-testid="ai-insight-list">
            {insights.map((insight) => (
              <li key={insight.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{TYPE_LABEL[insight.type]}</Badge>
                      {insight.severity && (
                        <Badge variant={SEVERITY_VARIANT[insight.severity]}>
                          {SEVERITY_LABEL[insight.severity]}
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-xs">
                        {Math.round(insight.confidence * 100)}% de confiança
                      </span>
                    </div>
                    <p className="text-foreground text-sm font-medium">{insight.title}</p>
                    <p className="text-muted-foreground text-sm">{insight.description}</p>
                    {(insight.actions?.length ?? 0) > 0 && (
                      <ul className="text-muted-foreground list-disc pl-4 text-xs">
                        {insight.actions?.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissInsight(insight.id)}
                    aria-label={`Dispensar insight ${insight.id}`}
                  >
                    Dispensar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
