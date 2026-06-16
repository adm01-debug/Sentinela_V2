import * as React from "react";
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Lock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export interface SecurityMetric {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "critical";
  icon?: React.ReactNode;
  description?: string;
}

export interface SecurityScoreDashboardProps {
  overallScore: number;
  metrics: SecurityMetric[];
  lastUpdated?: Date;
  onRefresh?: () => void;
  className?: string;
}

const getScoreLevel = (score: number) => {
  if (score >= 80)
    return { level: "Excellent", color: "text-green-500", bg: "bg-green-500", icon: ShieldCheck };
  if (score >= 60)
    return { level: "Good", color: "text-blue-500", bg: "bg-blue-500", icon: Shield };
  if (score >= 40)
    return { level: "Fair", color: "text-yellow-500", bg: "bg-yellow-500", icon: ShieldAlert };
  return { level: "Critical", color: "text-red-500", bg: "bg-red-500", icon: ShieldX };
};

const statusColors = {
  good: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
};

export function SecurityScoreDashboard({
  overallScore,
  metrics,
  lastUpdated,
  onRefresh,
  className,
}: SecurityScoreDashboardProps) {
  const scoreLevel = getScoreLevel(overallScore);
  const Icon = scoreLevel.icon;

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
          {onRefresh && (
            <button onClick={onRefresh} className="rounded-full p-2 hover:bg-muted">
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div
              className={cn(
                "flex h-24 w-24 items-center justify-center rounded-full",
                scoreLevel.bg,
                "bg-opacity-10"
              )}
            >
              <div className="text-center">
                <Icon className={cn("mx-auto h-8 w-8", scoreLevel.color)} />
                <span className={cn("text-2xl font-bold", scoreLevel.color)}>{overallScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Overall Security</span>
                <Badge variant="outline" className={scoreLevel.color}>
                  {scoreLevel.level}
                </Badge>
              </div>
              <Progress value={overallScore} className="h-3" />
              {lastUpdated && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {metric.icon || <Lock className="h-4 w-4 text-muted-foreground" />}
                  <span className="font-medium">{metric.label}</span>
                </div>
                <Badge className={statusColors[metric.status]}>{metric.status}</Badge>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-medium">
                    {metric.score}/{metric.maxScore}
                  </span>
                </div>
                <Progress value={(metric.score / metric.maxScore) * 100} className="h-2" />
              </div>
              {metric.description && (
                <p className="mt-2 text-xs text-muted-foreground">{metric.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default SecurityScoreDashboard;
