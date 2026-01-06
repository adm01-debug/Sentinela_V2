import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface SecurityMetric {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "critical";
  description?: string;
}

interface SecurityScoreDashboardProps {
  overallScore: number;
  metrics: SecurityMetric[];
  lastUpdated?: Date;
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};

const getScoreIcon = (score: number) => {
  if (score >= 80) return <ShieldCheck className="h-12 w-12 text-green-500" />;
  if (score >= 60) return <Shield className="h-12 w-12 text-yellow-500" />;
  if (score >= 40) return <ShieldAlert className="h-12 w-12 text-orange-500" />;
  return <ShieldX className="h-12 w-12 text-red-500" />;
};

const getStatusIcon = (status: SecurityMetric["status"]) => {
  switch (status) {
    case "good": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "critical": return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const getScoreLabel = (score: number): string => {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Muito Bom";
  if (score >= 70) return "Bom";
  if (score >= 60) return "Regular";
  if (score >= 40) return "Atenção";
  return "Crítico";
};

export function SecurityScoreDashboard({
  overallScore,
  metrics,
  lastUpdated,
  className,
}: SecurityScoreDashboardProps) {
  const criticalCount = metrics.filter((m) => m.status === "critical").length;
  const warningCount = metrics.filter((m) => m.status === "warning").length;

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Score de Segurança</CardTitle>
          {lastUpdated && (
            <CardDescription>Atualizado em {lastUpdated.toLocaleString("pt-BR")}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {getScoreIcon(overallScore)}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className={cn("text-4xl font-bold", getScoreColor(overallScore))}>{overallScore}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
              <p className={cn("text-sm font-medium", getScoreColor(overallScore))}>{getScoreLabel(overallScore)}</p>
              <Progress value={overallScore} className="mt-2 h-2" indicatorClassName={getScoreBg(overallScore)} />
            </div>
            <div className="flex gap-2">
              {criticalCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" /> {criticalCount} crítico{criticalCount > 1 ? "s" : ""}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="h-3 w-3" /> {warningCount} alerta{warningCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric) => (
          <Card key={metric.id} className={cn(metric.status === "critical" && "border-red-200 bg-red-50/50", metric.status === "warning" && "border-yellow-200 bg-yellow-50/50")}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-medium">{metric.label}</span>
                </div>
                <span className={cn("font-bold", getScoreColor((metric.score / metric.maxScore) * 100))}>
                  {metric.score}/{metric.maxScore}
                </span>
              </div>
              <Progress value={(metric.score / metric.maxScore) * 100} className="mt-2 h-1.5" />
              {metric.description && (
                <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 shrink-0" />
                  {metric.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SecurityScoreDashboard;
