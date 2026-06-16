import { memo } from "react";
import { AlertTriangle, AlertCircle, Info, Bell, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAlerts } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const severityIcons = {
  low: Info,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: AlertTriangle,
};
const severityStyles: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-warning",
  high: "text-destructive",
  critical: "text-destructive",
};
const severityVariants: Record<string, "default" | "warning" | "destructive"> = {
  low: "default",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
};
const severityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const RecentAlertsBase = () => {
  const { data: alerts } = useAlerts({ acknowledged: false });
  const navigate = useNavigate();
  const recentAlerts = alerts?.data.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-warning" />
            Alertas Recentes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/alerts")}
            className="gap-1 text-xs"
          >
            Ver todos <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentAlerts.length > 0 ? (
          <div className="space-y-3">
            {recentAlerts.map((alert) => {
              const Icon = severityIcons[alert.severity as keyof typeof severityIcons] || Info;
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
                >
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", severityStyles[alert.severity])} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-card-foreground">
                        {alert.title}
                      </span>
                      <Badge
                        variant={severityVariants[alert.severity]}
                        className="shrink-0 text-[10px]"
                      >
                        {severityLabels[alert.severity] || alert.severity}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {alert.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm font-medium">Nenhum alerta pendente</p>
            <p className="text-xs">Tudo está em ordem!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export const RecentAlerts = memo(RecentAlertsBase);
