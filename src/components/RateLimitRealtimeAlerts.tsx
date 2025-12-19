import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, X, Bell, BellOff, Shield, Zap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { playSoundBySeverity } from "@/utils/notificationSound";
import { SoundSettings } from "@/hooks/useRateLimitSettings";

interface RealtimeAlert {
  id: string;
  type: 'rate_limit' | 'ip_blocked';
  endpoint?: string;
  identifier: string;
  requestCount?: number;
  timestamp: Date;
  severity: 'medium' | 'high' | 'critical';
}

interface RateLimitRealtimeAlertsProps {
  alertThreshold?: number;
  soundSettings?: SoundSettings;
}

const defaultSoundSettings: SoundSettings = {
  enabled: true,
  soundType: 'chime',
  volume: 70,
  playCritical: true,
  playHigh: true,
  playMedium: false,
};

export const RateLimitRealtimeAlerts = ({ 
  alertThreshold = 50,
  soundSettings = defaultSoundSettings 
}: RateLimitRealtimeAlertsProps) => {
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!isEnabled) return;

    // Subscribe to rate_limit_logs inserts
    const rateLimitChannel = supabase
      .channel('rate-limit-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rate_limit_logs'
        },
        (payload) => {
          const log = payload.new as {
            id: string;
            endpoint: string;
            identifier: string;
            request_count: number;
            created_at: string;
          };

          // Only alert if request count exceeds threshold
          if (log.request_count && log.request_count >= alertThreshold) {
            const severity = log.request_count > 100 ? 'critical' : log.request_count > 75 ? 'high' : 'medium';
            
            const newAlert: RealtimeAlert = {
              id: log.id,
              type: 'rate_limit',
              endpoint: log.endpoint,
              identifier: log.identifier,
              requestCount: log.request_count,
              timestamp: new Date(log.created_at),
              severity,
            };

            setAlerts(prev => [newAlert, ...prev].slice(0, 20));

            // Play sound based on severity and settings
            playSoundBySeverity(severity, soundSettings);

            // Show toast notification
            toast.warning(`Alto volume de requisições detectado`, {
              description: `${log.identifier.slice(0, 20)}... - ${log.request_count} requisições em ${log.endpoint}`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to blocked_ips inserts
    const blockedIPsChannel = supabase
      .channel('blocked-ips-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blocked_ips'
        },
        (payload) => {
          const blocked = payload.new as {
            id: string;
            ip_address: string;
            reason: string;
            blocked_at: string;
          };

          const newAlert: RealtimeAlert = {
            id: blocked.id,
            type: 'ip_blocked',
            identifier: blocked.ip_address,
            timestamp: new Date(blocked.blocked_at),
            severity: 'critical',
          };

          setAlerts(prev => [newAlert, ...prev].slice(0, 20));

          // Always play alarm sound for blocked IPs (critical)
          playSoundBySeverity('critical', soundSettings);

          toast.error(`IP Bloqueado`, {
            description: `${blocked.ip_address} foi bloqueado: ${blocked.reason || 'Atividade suspeita'}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rateLimitChannel);
      supabase.removeChannel(blockedIPsChannel);
    };
  }, [isEnabled, alertThreshold, soundSettings]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/10 text-destructive';
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default:
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">Alto</Badge>;
      default:
        return <Badge className="bg-yellow-500">Médio</Badge>;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      {/* Toggle Button */}
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEnabled(!isEnabled)}
          className={cn(
            "gap-2",
            isEnabled ? "bg-green-500/10 border-green-500/50" : "bg-muted"
          )}
        >
          {isEnabled ? (
            <>
              <Bell className="h-4 w-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Alertas Ativos</span>
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              <span>Alertas Desativados</span>
            </>
          )}
        </Button>
      </div>

      {/* Alerts Panel */}
      {isEnabled && alerts.length > 0 && (
        <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-medium">Alertas em Tempo Real</span>
              <Badge variant="secondary">{alerts.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearAllAlerts(); }}>
                Limpar
              </Button>
            </div>
          </div>

          {/* Alerts List */}
          {isExpanded && (
            <ScrollArea className="max-h-80">
              <div className="p-2 space-y-2">
                {alerts.map((alert) => (
                  <Alert 
                    key={alert.id} 
                    className={cn(
                      "relative pr-8 transition-all animate-in slide-in-from-right-5",
                      getSeverityStyles(alert.severity)
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <div className="flex items-start gap-2">
                      {alert.type === 'ip_blocked' ? (
                        <Shield className="h-4 w-4 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <AlertTitle className="text-sm font-medium flex items-center gap-2">
                          {alert.type === 'ip_blocked' ? 'IP Bloqueado' : 'Rate Limit'}
                          {getSeverityBadge(alert.severity)}
                        </AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                          <div className="truncate font-mono">
                            {alert.identifier}
                          </div>
                          {alert.type === 'rate_limit' && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {alert.endpoint}
                              </Badge>
                              <span>{alert.requestCount} req</span>
                            </div>
                          )}
                          <div className="text-muted-foreground mt-1">
                            {format(alert.timestamp, "HH:mm:ss", { locale: ptBR })}
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Empty State */}
      {isEnabled && alerts.length === 0 && (
        <div className="bg-card border rounded-lg p-4 text-center text-muted-foreground">
          <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm">Sistema monitorado</p>
          <p className="text-xs">Alertas aparecerão aqui em tempo real</p>
        </div>
      )}
    </div>
  );
};
