import { useEffect } from "react";
import { Loader2, RefreshCw, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBehaviorPatterns, type BehaviorPattern } from "@/hooks/useBehaviorPatterns";

const TYPE_LABEL: Record<BehaviorPattern["type"], string> = {
  routine: "Rotina",
  deviation: "Desvio",
  trend: "Tendência",
  anomaly: "Anomalia",
};

const TYPE_VARIANT: Record<
  BehaviorPattern["type"],
  "secondary" | "warning" | "info" | "destructive"
> = {
  routine: "secondary",
  deviation: "warning",
  trend: "info",
  anomaly: "destructive",
};

const FREQUENCY_LABEL: Record<BehaviorPattern["frequency"], string> = {
  daily: "diário",
  weekly: "semanal",
  occasional: "ocasional",
};

export interface BehaviorPatternsPanelProps {
  /** Nome do funcionário: `behavior-pattern` filtra pelo campo `employee_name`. */
  employeeName?: string;
}

export const BehaviorPatternsPanel = ({ employeeName }: BehaviorPatternsPanelProps) => {
  const { patterns, deviations, anomalies, isLoading, error, analyzePatterns } =
    useBehaviorPatterns({
      employeeName,
    });

  useEffect(() => {
    void analyzePatterns();
  }, [analyzePatterns]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Repeat className="text-info h-4 w-4" />
          Padrões de comportamento
        </CardTitle>
        <div className="flex items-center gap-2">
          {anomalies.length > 0 && (
            <Badge variant="destructive">{anomalies.length} anomalia(s)</Badge>
          )}
          {deviations.length > 0 && <Badge variant="warning">{deviations.length} desvio(s)</Badge>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void analyzePatterns()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Analisar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="border-destructive/40 bg-destructive/5 flex items-center justify-between gap-3 rounded-lg border p-3">
            <p className="text-destructive text-sm">
              Não foi possível analisar os padrões: {error.message}
            </p>
            <Button variant="outline" size="sm" onClick={() => void analyzePatterns()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!error && isLoading && patterns.length === 0 && (
          <div className="text-muted-foreground flex items-center gap-2 p-3 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analisando padrões de comportamento...
          </div>
        )}

        {!error && !isLoading && patterns.length === 0 && (
          <p className="text-muted-foreground p-3 text-sm">
            Nenhum padrão de comportamento identificado nos últimos 30 dias
            {employeeName ? ` para ${employeeName}` : ""}.
          </p>
        )}

        {patterns.length > 0 && (
          <ul className="space-y-3" data-testid="behavior-pattern-list">
            {patterns.map((pattern) => (
              <li key={pattern.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={TYPE_VARIANT[pattern.type]}>{TYPE_LABEL[pattern.type]}</Badge>
                  <span className="text-muted-foreground text-xs">
                    {Math.round(pattern.confidence * 100)}% de confiança ·{" "}
                    {FREQUENCY_LABEL[pattern.frequency]}
                  </span>
                </div>
                <p className="text-foreground mt-1 text-sm">{pattern.description}</p>
                {(pattern.recommendations?.length ?? 0) > 0 && (
                  <ul className="text-muted-foreground mt-1 list-disc pl-4 text-xs">
                    {pattern.recommendations?.map((recommendation) => (
                      <li key={recommendation}>{recommendation}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default BehaviorPatternsPanel;
