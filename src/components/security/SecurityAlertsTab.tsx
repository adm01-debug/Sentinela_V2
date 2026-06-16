// ============================================================
// Security Alerts Tab
// ============================================================

import React from "react";
import { AlertTriangle, Bell, CheckCircle2, Globe, Monitor, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SecurityAlertItem {
  id: string;
  read?: boolean;
  severity?: string;
  title?: string;
  description?: string;
  created_at?: string;
  policy_name?: string;
  violation_type?: string;
  employee_name?: string;
  device?: string;
  ip_address?: string;
}

interface SecurityAlertsTabProps {
  alerts: SecurityAlertItem[];
}

function severityBg(severity?: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-600 dark:bg-red-900/30";
    case "high":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/30";
    case "medium":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30";
    default:
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30";
  }
}

export const SecurityAlertsTab = React.memo(function SecurityAlertsTab({
  alerts,
}: SecurityAlertsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alertas de Segurança
        </CardTitle>
        <CardDescription>Violações e eventos de segurança detectados</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {alerts.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
              <p className="text-muted-foreground">Nenhum alerta de segurança</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 rounded-lg border p-3 ${!alert.read ? "border-primary/30 bg-muted/50" : ""}`}
                >
                  <div className={`rounded-full p-2 ${severityBg(alert.severity)}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{alert.policy_name}</p>
                        <Badge
                          variant={
                            alert.severity === "critical" || alert.severity === "high"
                              ? "destructive"
                              : alert.severity === "medium"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {alert.severity}
                        </Badge>
                        {!alert.read && <Badge variant="default">Novo</Badge>}
                      </div>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.created_at ?? new Date()), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {alert.description || `Violação do tipo ${alert.violation_type}`}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {alert.employee_name}
                      </span>
                      {alert.device && (
                        <span className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          {alert.device}
                        </span>
                      )}
                      {alert.ip_address && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {alert.ip_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
