import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Shield, ArrowRight, ShieldOff, Inbox } from "lucide-react";
import { severityStyles, severityLabels } from "./dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/EmptyState";

interface Alert {
  id: string;
  message: string;
  severity: string;
  time: string;
  employee: string;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  icon?: React.ElementType;
}

interface DashboardAlertsCardProps {
  alerts: Alert[];
}

export const DashboardAlertsCard = memo(({ alerts }: DashboardAlertsCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="card-hover lg:col-span-5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
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
        <ScrollArea className="h-[240px]">
          {alerts.length === 0 ? (
            <EmptyState
              icon={ShieldOff}
              title="Nenhum alerta recente"
              description="Tudo tranquilo! Sem violações de segurança detectadas."
              className="py-10"
            />
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${severityStyles[alert.severity]}`}
                  onClick={() => navigate(`/alerts/${alert.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/alerts/${alert.id}`)}
                >
                  <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{alert.message}</p>
                    <p className="mt-0.5 text-xs opacity-70">
                      {alert.employee} · {alert.time}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                    {severityLabels[alert.severity]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

DashboardAlertsCard.displayName = "DashboardAlertsCard";

interface DashboardActivityCardProps {
  activities: ActivityItem[];
}

export const DashboardActivityCard = memo(({ activities }: DashboardActivityCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="card-hover lg:col-span-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bell className="h-4 w-4 text-primary" />
            Atividade Recente
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/activities")}
            className="gap-1 text-xs"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          {activities.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Sem atividade recente"
              description="As atividades dos funcionários aparecerão aqui em tempo real."
              className="py-10"
            />
          ) : (
            <div className="space-y-1">
              {activities.map((item) => {
                const initials = item.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                      <span className="text-[11px] font-semibold text-primary">{initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-card-foreground">
                        <span className="font-medium">{item.user}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

DashboardActivityCard.displayName = "DashboardActivityCard";
