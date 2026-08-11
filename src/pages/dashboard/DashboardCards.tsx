import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Shield, ArrowRight, ShieldOff, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/EmptyState';
import { severityStyles, severityLabels } from './dashboardData';

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
    <Card className="lg:col-span-5 card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-warning" />
            Alertas Recentes
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')} className="text-xs gap-1">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          {alerts.length === 0 ? (
            <EmptyState icon={ShieldOff} title="Nenhum alerta recente" description="Tudo tranquilo! Sem violações de segurança detectadas." className="py-10" />
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer ${severityStyles[alert.severity]}`}
                  onClick={() => navigate(`/alerts/${alert.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/alerts/${alert.id}`)}
                >
                  <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{alert.message}</p>
                    <p className="text-xs opacity-70 mt-0.5">{alert.employee} · {alert.time}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
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

DashboardAlertsCard.displayName = 'DashboardAlertsCard';

interface DashboardActivityCardProps {
  activities: ActivityItem[];
}

export const DashboardActivityCard = memo(({ activities }: DashboardActivityCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="lg:col-span-4 card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Atividade Recente
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/activities')} className="text-xs gap-1">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          {activities.length === 0 ? (
            <EmptyState icon={Inbox} title="Sem atividade recente" description="As atividades dos funcionários aparecerão aqui em tempo real." className="py-10" />
          ) : (
            <div className="space-y-1">
              {activities.map((item) => {
                const initials = item.user.split(' ').map(n => n[0]).join('').slice(0, 2);
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:-translate-y-0.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 shrink-0">
                      <span className="text-[11px] font-semibold text-primary">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground">
                        <span className="font-medium">{item.user}</span>{' '}
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

DashboardActivityCard.displayName = 'DashboardActivityCard';