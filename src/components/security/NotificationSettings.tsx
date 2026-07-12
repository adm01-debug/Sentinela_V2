import React from 'react';
import { useSecurityNotifications } from '@/hooks/useSecurityNotifications';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  type LucideIcon
} from 'lucide-react';

type AlertType = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
};

const ALERT_TYPES: readonly AlertType[] = [
  {
    id: 'critical',
    label: 'Alertas Críticos',
    description: 'Violações de alta severidade',
    icon: AlertTriangle,
    bg: 'bg-destructive/15',
    fg: 'text-destructive',
  },
  {
    id: 'high',
    label: 'Alertas de Alta Prioridade',
    description: 'Tentativas de acesso suspeitas',
    icon: AlertTriangle,
    bg: 'bg-warning/15',
    fg: 'text-warning',
  },
  {
    id: 'device',
    label: 'Novo Dispositivo',
    description: 'Login de dispositivo desconhecido',
    icon: Smartphone,
    bg: 'bg-primary/15',
    fg: 'text-primary',
  },
] as const;

export const NotificationSettings = React.memo(function NotificationSettings() {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    requestPermission 
  } = useSecurityNotifications();

  const getStatusIcon = () => {
    if (!isSupported) return <BellOff className="h-8 w-8 text-muted-foreground" />;
    if (permission === 'granted') return <BellRing className="h-8 w-8 text-success" />;
    if (permission === 'denied') return <XCircle className="h-8 w-8 text-destructive" />;
    return <Bell className="h-8 w-8 text-warning" />;
  };

  const getStatusText = () => {
    if (!isSupported) return 'Não suportado';
    if (permission === 'granted') return 'Ativado';
    if (permission === 'denied') return 'Bloqueado';
    return 'Não configurado';
  };

  const getStatusBadge = () => {
    if (!isSupported) return <Badge variant="secondary">Não suportado</Badge>;
    if (permission === 'granted') return <Badge variant="default">Ativo</Badge>;
    if (permission === 'denied') return <Badge variant="destructive">Bloqueado</Badge>;
    return <Badge variant="outline">Pendente</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" aria-hidden="true" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas de segurança em tempo real no navegador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Card */}
        <div
          className="flex items-center justify-between p-4 border rounded-lg"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <p className="font-medium">Status das Notificações</p>
              <p className="text-sm text-muted-foreground">
                {!isSupported 
                  ? 'Seu navegador não suporta notificações push'
                  : permission === 'granted'
                    ? isSubscribed
                      ? 'Você receberá alertas em tempo real'
                      : 'Permissão concedida — conectando ao servidor…'
                    : permission === 'denied'
                      ? 'Notificações foram bloqueadas'
                      : 'Clique para ativar notificações'}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Permission Request Button */}
        {isSupported && permission !== 'granted' && (
          <div className="space-y-4">
            {permission === 'denied' ? (
              <div
                className="flex items-start gap-3 p-4 border border-warning/40 bg-warning/5 rounded-lg"
                role="alert"
              >
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" aria-hidden="true" />
                <div className="space-y-2">
                  <p className="font-medium text-warning">
                    Notificações bloqueadas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Para receber alertas de segurança, você precisa desbloquear as notificações
                    nas configurações do navegador:
                  </p>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Clique no ícone de cadeado na barra de endereço</li>
                    <li>Encontre a opção "Notificações"</li>
                    <li>Altere de "Bloquear" para "Permitir"</li>
                    <li>Recarregue a página</li>
                  </ol>
                </div>
              </div>
            ) : (
              <Button onClick={requestPermission} className="w-full" size="lg">
                <BellRing className="h-4 w-4 mr-2" aria-hidden="true" />
                Ativar Notificações Push
              </Button>
            )}
          </div>
        )}

        {/* Notification Types */}
        {permission === 'granted' && (
          <div className="space-y-4">
            <h4 className="font-medium">Tipos de Alertas</h4>

            <ul className="space-y-3" aria-label="Tipos de alertas">
              {ALERT_TYPES.map((alert) => {
                const Icon = alert.icon;
                return (
                  <li key={alert.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-full ${alert.bg} shrink-0`} aria-hidden="true">
                        <Icon className={`h-4 w-4 ${alert.fg}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{alert.label}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <Switch
                      defaultChecked
                      disabled
                      aria-label={`${alert.label}: sempre ativo`}
                    />
                  </li>
                );
              })}
            </ul>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                <span>
                  {isSubscribed
                    ? 'Conectado ao sistema de alertas em tempo real'
                    : 'Conectando ao sistema de alertas…'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
