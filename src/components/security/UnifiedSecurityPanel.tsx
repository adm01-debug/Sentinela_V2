import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMFA } from '@/hooks/useMFA';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useBlockedIPs } from '@/hooks/useBlockedIPs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Monitor, 
  Laptop,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Activity,
  Bell,
  Users,
  Ban,
  Eye,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { queryKeys, queryPresets } from '@/lib/queryClient';
import { KnownDevicesPanel } from './KnownDevicesPanel';

interface SecurityScore {
  total: number;
  mfa: number;
  sessions: number;
  devices: number;
  alerts: number;
}

function calculateSecurityScore(
  mfaEnabled: boolean,
  trustedDevices: number,
  totalDevices: number,
  unresolvedAlerts: number
): SecurityScore {
  let mfa = mfaEnabled ? 25 : 0;
  let sessions = 25; // Base score for active session
  let devices = totalDevices > 0 ? Math.round((trustedDevices / totalDevices) * 25) : 25;
  let alerts = Math.max(0, 25 - (unresolvedAlerts * 5));
  
  return {
    total: mfa + sessions + devices + alerts,
    mfa,
    sessions,
    devices,
    alerts
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreBadge(score: number): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (score >= 80) return { label: 'Excelente', variant: 'default' };
  if (score >= 60) return { label: 'Bom', variant: 'secondary' };
  if (score >= 40) return { label: 'Moderado', variant: 'outline' };
  return { label: 'Crítico', variant: 'destructive' };
}

function DeviceIcon({ type }: { type: string }) {
  switch (type?.toLowerCase()) {
    case 'mobile': return <Smartphone className="h-4 w-4" />;
    case 'tablet': return <Laptop className="h-4 w-4" />;
    default: return <Monitor className="h-4 w-4" />;
  }
}

export const UnifiedSecurityPanel = React.memo(function UnifiedSecurityPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { isEnrolled, factors, loading: mfaLoading, checkMFAStatus } = useMFA();
  const { getKnownDevices, getLoginEvents } = useDeviceDetection();
  const { data: blockedIPs } = useBlockedIPs();
  
  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);
  
  // Fetch known devices
  const { data: devices = [], isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['security', 'devices', userId],
    queryFn: () => userId ? getKnownDevices(userId) : Promise.resolve([]),
    enabled: !!userId,
    ...queryPresets.config,
  });
  
  // Fetch login events
  const { data: loginEvents = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['security', 'loginEvents', userId],
    queryFn: () => userId ? getLoginEvents(userId, 20) : Promise.resolve([]),
    enabled: !!userId,
    ...queryPresets.config,
  });
  
  // Fetch security violations/alerts
  const { data: alerts = [], isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: queryKeys.security.events(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    ...queryPresets.list,
  });
  
  // Fetch security settings
  const { data: settings } = useQuery({
    queryKey: queryKeys.security.settings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitoring_settings')
        .select('*')
        .in('setting_key', ['mfa_required', 'ip_whitelist_enabled', 'session_timeout_hours']);
      if (error) throw error;
      return {
        mfa_required: data?.find(s => s.setting_key === 'mfa_required')?.setting_value === true,
        ip_whitelist_enabled: data?.find(s => s.setting_key === 'ip_whitelist_enabled')?.setting_value === true,
        session_timeout: data?.find(s => s.setting_key === 'session_timeout_hours')?.setting_value || 24,
      };
    },
  });
  
  const trustedDevices = devices.filter(d => d.is_trusted).length;
  const unresolvedAlerts = alerts.filter(a => !a.read).length;
  const score = calculateSecurityScore(isEnrolled, trustedDevices, devices.length, unresolvedAlerts);
  const scoreBadge = getScoreBadge(score.total);
  
  const isLoading = mfaLoading || devicesLoading || eventsLoading || alertsLoading;
  
  const handleRefresh = () => {
    checkMFAStatus();
    refetchDevices();
    refetchEvents();
    refetchAlerts();
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Painel de Segurança</CardTitle>
                <CardDescription>Visão geral completa da segurança da sua conta</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Security Score */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Pontuação de Segurança</span>
                <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold ${getScoreColor(score.total)}`}>
                  {score.total}
                </div>
                <div className="text-sm text-muted-foreground">de 100 pontos</div>
              </div>
              <Progress value={score.total} className="h-2" />
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span>MFA: {score.mfa}/25</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>Sessões: {score.sessions}/25</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span>Dispositivos: {score.devices}/25</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span>Alertas: {score.alerts}/25</span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {isEnrolled ? (
                      <ShieldCheck className="h-8 w-8 text-green-500" />
                    ) : (
                      <ShieldAlert className="h-8 w-8 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">MFA</p>
                      <p className="font-semibold">{isEnrolled ? 'Ativo' : 'Inativo'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dispositivos</p>
                      <p className="font-semibold">{devices.length} ({trustedDevices} confiáveis)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Logins Recentes</p>
                      <p className="font-semibold">{loginEvents.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {unresolvedAlerts > 0 ? (
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Alertas</p>
                      <p className="font-semibold">{unresolvedAlerts} pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Eye className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="mfa" className="gap-2">
            <Key className="h-4 w-4" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Monitor className="h-4 w-4" />
            Dispositivos
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Activity className="h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alertas
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span>MFA Obrigatório</span>
                  <Badge variant={settings?.mfa_required ? 'default' : 'secondary'}>
                    {settings?.mfa_required ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span>Whitelist de IP</span>
                  <Badge variant={settings?.ip_whitelist_enabled ? 'default' : 'secondary'}>
                    {settings?.ip_whitelist_enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span>Timeout da Sessão</span>
                  <Badge variant="outline">{settings?.session_timeout || 24}h</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span>IPs Bloqueados</span>
                  <Badge variant={blockedIPs && blockedIPs.length > 0 ? 'destructive' : 'secondary'}>
                    {blockedIPs?.length || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {loginEvents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhum evento recente</p>
                  ) : (
                    <div className="space-y-3">
                      {loginEvents.slice(0, 5).map((event: any) => (
                        <div key={event.id} className="flex items-start gap-3 text-sm">
                          <div className={`mt-1 p-1 rounded-full ${
                            event.event_type === 'login_success' ? 'bg-green-100 text-green-600' :
                            event.event_type === 'login_failed' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {event.event_type === 'login_success' ? <CheckCircle2 className="h-3 w-3" /> :
                             event.event_type === 'login_failed' ? <XCircle className="h-3 w-3" /> :
                             <Activity className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {event.event_type === 'login_success' ? 'Login bem-sucedido' :
                               event.event_type === 'login_failed' ? 'Tentativa de login falhou' :
                               event.event_type === 'new_device' ? 'Novo dispositivo detectado' :
                               event.event_type}
                            </p>
                            <p className="text-muted-foreground truncate">
                              {event.ip_address} • {event.location || 'Local desconhecido'}
                            </p>
                          </div>
                          <span className="text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Recommendations */}
          {score.total < 100 && (
            <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  Recomendações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {!isEnrolled && (
                    <li className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Ative a autenticação de dois fatores (MFA) para proteger sua conta</span>
                    </li>
                  )}
                  {trustedDevices < devices.length && devices.length > 0 && (
                    <li className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Revise e marque como confiáveis os dispositivos que você reconhece</span>
                    </li>
                  )}
                  {unresolvedAlerts > 0 && (
                    <li className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Você tem {unresolvedAlerts} alerta(s) pendente(s) para revisar</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* MFA Tab */}
        <TabsContent value="mfa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Autenticação Multi-Fator
              </CardTitle>
              <CardDescription>
                Gerencie seus métodos de autenticação de dois fatores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isEnrolled ? (
                    <ShieldCheck className="h-10 w-10 text-green-500" />
                  ) : (
                    <ShieldAlert className="h-10 w-10 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">Status do MFA</p>
                    <p className="text-sm text-muted-foreground">
                      {isEnrolled ? 'Sua conta está protegida com MFA' : 'MFA não está configurado'}
                    </p>
                  </div>
                </div>
                <Badge variant={isEnrolled ? 'default' : 'destructive'}>
                  {isEnrolled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              {factors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Fatores Configurados</h4>
                  {factors.map((factor) => (
                    <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{factor.friendly_name || 'Authenticator App'}</p>
                          <p className="text-sm text-muted-foreground">
                            Tipo: {factor.factor_type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={factor.status === 'verified' ? 'default' : 'secondary'}>
                        {factor.status === 'verified' ? 'Verificado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {!isEnrolled && (
                <Button className="w-full" onClick={() => window.location.href = '/settings?tab=security'}>
                  <Key className="h-4 w-4 mr-2" />
                  Configurar MFA
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices">
          {userId && <KnownDevicesPanel />}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Histórico de Sessões
              </CardTitle>
              <CardDescription>
                Eventos de login e atividade da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {loginEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum evento registrado</p>
                ) : (
                  <div className="space-y-3">
                    {loginEvents.map((event: any) => (
                      <div key={event.id} className="flex items-start gap-4 p-3 border rounded-lg">
                        <div className={`p-2 rounded-full ${
                          event.event_type === 'login_success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                          event.event_type === 'login_failed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                          event.event_type === 'new_device' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {event.event_type === 'login_success' ? <CheckCircle2 className="h-5 w-5" /> :
                           event.event_type === 'login_failed' ? <XCircle className="h-5 w-5" /> :
                           event.event_type === 'new_device' ? <Smartphone className="h-5 w-5" /> :
                           <Activity className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">
                              {event.event_type === 'login_success' ? 'Login bem-sucedido' :
                               event.event_type === 'login_failed' ? 'Tentativa de login falhou' :
                               event.event_type === 'new_device' ? 'Novo dispositivo detectado' :
                               event.event_type === 'logout' ? 'Logout' :
                               event.event_type}
                            </p>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(event.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {event.ip_address && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {event.ip_address}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                          {event.user_agent && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {event.user_agent.substring(0, 80)}...
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas de Segurança
              </CardTitle>
              <CardDescription>
                Violações e eventos de segurança detectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum alerta de segurança</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert: any) => (
                      <div key={alert.id} className={`flex items-start gap-4 p-3 border rounded-lg ${
                        !alert.read ? 'bg-muted/50 border-primary/30' : ''
                      }`}>
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                        }`}>
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{alert.policy_name}</p>
                              <Badge variant={
                                alert.severity === 'critical' ? 'destructive' :
                                alert.severity === 'high' ? 'destructive' :
                                alert.severity === 'medium' ? 'secondary' : 'outline'
                              }>
                                {alert.severity}
                              </Badge>
                              {!alert.read && <Badge variant="default">Novo</Badge>}
                            </div>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description || `Violação do tipo ${alert.violation_type}`}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
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
        </TabsContent>
      </Tabs>
    </div>
  );
});
