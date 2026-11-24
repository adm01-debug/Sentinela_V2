import { useEffect } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnomalyDetection, type AnomalySeverity } from "@/hooks/useAnomalyDetection";

const SEVERITY_LABEL: Record<AnomalySeverity, string> = {
  critical: "Crítica",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const SEVERITY_VARIANT: Record<
  AnomalySeverity,
  "destructive" | "warning" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

export const AnomalyDetectionPanel = () => {
  const {
    anomalies,
    metadata,
    isLoading,
    error,
    detectAnomalies,
    dismissAnomaly,
    criticalCount,
    highCount,
  } = useAnomalyDetection();

  useEffect(() => {
    void detectAnomalies();
  }, [detectAnomalies]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="text-warning h-4 w-4" />
          Anomalias de atividade
        </CardTitle>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && <Badge variant="destructive">{criticalCount} crítica(s)</Badge>}
          {highCount > 0 && <Badge variant="warning">{highCount} alta(s)</Badge>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void detectAnomalies()}
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
              Não foi possível analisar as atividades: {error.message}
            </p>
            <Button variant="outline" size="sm" onClick={() => void detectAnomalies()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!error && isLoading && anomalies.length === 0 && (
          <div className="text-muted-foreground flex items-center gap-2 p-3 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analisando atividades...
          </div>
        )}

        {!error && !isLoading && anomalies.length === 0 && (
          <p className="text-muted-foreground p-3 text-sm">
            Nenhuma anomalia de atividade{" "}
            {metadata ? `nas últimas ${metadata.timeRange}` : "no período"} —{" "}
            {metadata?.analyzedRecords ?? 0} registro(s) analisado(s).
          </p>
        )}

        {anomalies.length > 0 && (
          <ul className="space-y-3" data-testid="anomaly-list">
            {anomalies.map((anomaly) => (
              <li key={anomaly.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={SEVERITY_VARIANT[anomaly.severity]}>
                        {SEVERITY_LABEL[anomaly.severity]}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {Math.round(anomaly.probability * 100)}% de confiança ·{" "}
                        {anomaly.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-foreground text-sm">{anomaly.description}</p>
                    {anomaly.affectedEntities.length > 0 && (
                      <p className="text-muted-foreground text-xs">
                        Envolvidos: {anomaly.affectedEntities.join(", ")}
                      </p>
                    )}
                    {anomaly.suggestedActions.length > 0 && (
                      <ul className="text-muted-foreground list-disc pl-4 text-xs">
                        {anomaly.suggestedActions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAnomaly(anomaly.id)}
                    aria-label={`Dispensar anomalia ${anomaly.id}`}
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

export default AnomalyDetectionPanel;
