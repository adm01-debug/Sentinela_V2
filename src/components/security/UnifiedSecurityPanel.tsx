// ============================================================
// UNIFIED SECURITY PANEL - Refactored with sub-components
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMFA } from '@/hooks/useMFA';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useBlockedIPs } from '@/hooks/useBlockedIPs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Lock, AlertTriangle, XCircle, CheckCircle2, Activity,
  Eye, Bell, Key, Monitor, MapPin, Globe, Fingerprint,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { queryKeys, queryPresets } from '@/lib/queryClient';

/** Format ISO date safely; returns null on invalid input to avoid "Invalid Date". */
function safeRelativeDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

// Sub-components
import { SecurityScoreCard, calculateSecurityScore } from './SecurityScoreCard';
import { SessionHistoryTab, type LoginEvent } from './SessionHistoryTab';
import { SecurityAlertsTab } from './SecurityAlertsTab';
import { MFAStatusTab } from './MFAStatusTab';
import { KnownDevicesPanel } from './KnownDevicesPanel';
import { NotificationSettings } from './NotificationSettings';
import { WebAuthnSettings } from './WebAuthnSettings';
import { IPWhitelistManager } from './IPWhitelistManager';
import { GeoBlockingManager } from './GeoBlockingManager';

// ============================================================
// TYPES
// ============================================================

interface MonitoringSetting {
  setting_key: string;
  setting_value: unknown;
}

interface SecuritySettings {
  mfa_required: boolean;
  ip_whitelist_enabled: boolean;
  session_timeout: number;
}

interface KnownDevice {
  id: string;
  is_trusted: boolean;
  device_type: string;
}

interface SecurityAlert {
  id: string;
  read?: boolean;
}

const TABS = [
  { value: 'overview', label: 'Visão Geral', icon: Eye },
  { value: 'mfa', label: 'MFA', icon: Key },
  { value: 'passkeys', label: 'Passkeys', icon: Fingerprint },
  { value: 'devices', label: 'Dispositivos', icon: Monitor },
  { value: 'sessions', label: 'Sessões', icon: Activity },
  { value: 'alerts', label: 'Alertas', icon: Bell },
  { value: 'whitelist', label: 'IP Whitelist', icon: MapPin },
  { value: 'geo', label: 'Geo', icon: Globe },
  { value: 'notifications', label: 'Push', icon: Bell },
] as const;

// ============================================================
// MAIN COMPONENT
// ============================================================

export const UnifiedSecurityPanel = React.memo(function UnifiedSecurityPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { isEnrolled, factors, loading: mfaLoading, checkMFAStatus } = useMFA();
  const { getKnownDevices, getLoginEvents } = useDeviceDetection();
  const { data: blockedIPs } = useBlockedIPs();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled && user) setUserId(user.id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const { data: devices = [], isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['security', 'devices', userId],
    queryFn: () => (userId ? getKnownDevices(userId) : Promise.resolve([])),
    enabled: !!userId,
    ...queryPresets.config,
  });

  const { data: loginEvents = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['security', 'loginEvents', userId],
    queryFn: () => (userId ? getLoginEvents(userId, 20) : Promise.resolve([])),
    enabled: !!userId,
    ...queryPresets.config,
  });

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

  const { data: settings } = useQuery<SecuritySettings>({
    queryKey: queryKeys.security.settings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitoring_settings')
        .select('*')
        .in('setting_key', ['mfa_required', 'ip_whitelist_enabled', 'session_timeout_hours']);
      if (error) throw error;
      const rows = (data ?? []) as MonitoringSetting[];
      return {
        mfa_required: rows.find((s) => s.setting_key === 'mfa_required')?.setting_value === true,
        ip_whitelist_enabled: rows.find((s) => s.setting_key === 'ip_whitelist_enabled')?.setting_value === true,
        session_timeout: (rows.find((s) => s.setting_key === 'session_timeout_hours')?.setting_value as number) || 24,
      };
    },
  });

  const devicesArr = useMemo(() => (Array.isArray(devices) ? (devices as KnownDevice[]) : []), [devices]);
  const alertsArr = useMemo(() => (Array.isArray(alerts) ? (alerts as SecurityAlert[]) : []), [alerts]);
  const eventsArr = useMemo(() => (Array.isArray(loginEvents) ? (loginEvents as LoginEvent[]) : []), [loginEvents]);

  const trustedDevices = devicesArr.filter((d) => d.is_trusted).length;
  const unresolvedAlerts = alertsArr.filter((a) => !a.read).length;
  const score = calculateSecurityScore(isEnrolled, trustedDevices, devicesArr.length, unresolvedAlerts);
  const isLoading = mfaLoading || devicesLoading || eventsLoading || alertsLoading;

  const handleRefresh = () => {
    checkMFAStatus();
    refetchDevices();
    refetchEvents();
    refetchAlerts();
  };

  return (
    <div className="space-y-6">
      <SecurityScoreCard
        score={score}
        isEnrolled={isEnrolled}
        devicesCount={devicesArr.length}
        trustedDevices={trustedDevices}
        loginEventsCount={eventsArr.length}
        unresolvedAlerts={unresolvedAlerts}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex md:grid md:w-full md:grid-cols-9">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                aria-label={label}
                className="gap-1 text-xs sm:text-sm"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <OverviewSettingsCard settings={settings} blockedIPsCount={blockedIPs?.length ?? 0} />
            <OverviewActivityCard loginEvents={eventsArr} />
          </div>
          {score.total < 100 && (
            <SecurityRecommendations
              isEnrolled={isEnrolled}
              trustedDevices={trustedDevices}
              totalDevices={devicesArr.length}
              unresolvedAlerts={unresolvedAlerts}
            />
          )}
        </TabsContent>

        <TabsContent value="mfa"><MFAStatusTab isEnrolled={isEnrolled} factors={Array.isArray(factors) ? factors : []} /></TabsContent>
        <TabsContent value="passkeys"><WebAuthnSettings /></TabsContent>
        <TabsContent value="devices">{userId && <KnownDevicesPanel />}</TabsContent>
        <TabsContent value="sessions"><SessionHistoryTab loginEvents={eventsArr} /></TabsContent>
        <TabsContent value="alerts"><SecurityAlertsTab alerts={alertsArr} /></TabsContent>
        <TabsContent value="whitelist"><IPWhitelistManager /></TabsContent>
        <TabsContent value="geo"><GeoBlockingManager /></TabsContent>
        <TabsContent value="notifications"><NotificationSettings /></TabsContent>
      </Tabs>
    </div>
  );
});

// ============================================================
// Sub-components for overview tab
// ============================================================

function OverviewSettingsCard({ settings, blockedIPsCount }: { settings?: SecuritySettings; blockedIPsCount: number }) {
  const rows: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: 'MFA Obrigatório',
      value: <Badge variant={settings?.mfa_required ? 'default' : 'secondary'}>{settings?.mfa_required ? 'Sim' : 'Não'}</Badge>,
    },
    {
      label: 'Whitelist de IP',
      value: <Badge variant={settings?.ip_whitelist_enabled ? 'default' : 'secondary'}>{settings?.ip_whitelist_enabled ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      label: 'Timeout da Sessão',
      value: <Badge variant="outline">{settings?.session_timeout ?? 24}h</Badge>,
    },
    {
      label: 'IPs Bloqueados',
      value: <Badge variant={blockedIPsCount > 0 ? 'destructive' : 'secondary'}>{blockedIPsCount}</Badge>,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="h-5 w-5" aria-hidden="true" />
          Configurações de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row, i) => (
          <React.Fragment key={row.label}>
            <div className="flex items-center justify-between py-2">
              <span>{row.label}</span>
              {row.value}
            </div>
            {i < rows.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

const EVENT_META: Partial<Record<LoginEvent['event_type'], { label: string; icon: LucideIcon; cls: string }>> = {
  login_success: { label: 'Login bem-sucedido', icon: CheckCircle2, cls: 'bg-success/15 text-success' },
  login_failed: { label: 'Tentativa de login falhou', icon: XCircle, cls: 'bg-destructive/15 text-destructive' },
  new_device: { label: 'Novo dispositivo detectado', icon: Activity, cls: 'bg-primary/15 text-primary' },
  logout: { label: 'Sessão encerrada', icon: XCircle, cls: 'bg-muted text-muted-foreground' },
};

const DEFAULT_EVENT_META = { label: 'Evento', icon: Activity, cls: 'bg-primary/15 text-primary' } as const;

function EventIcon({ type }: { type: LoginEvent['event_type'] }) {
  const meta = EVENT_META[type] ?? EVENT_META.new_device;
  const Icon = meta.icon;
  return (
    <div className={`mt-1 p-1 rounded-full shrink-0 ${meta.cls}`} aria-hidden="true">
      <Icon className="h-3 w-3" />
    </div>
  );
}

function OverviewActivityCard({ loginEvents }: { loginEvents: LoginEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" aria-hidden="true" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {loginEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum evento recente</p>
          ) : (
            <ul className="space-y-3" aria-label="Eventos recentes de login">
              {loginEvents.slice(0, 5).map((event) => {
                const meta = EVENT_META[event.event_type] ?? EVENT_META.new_device;
                const rel = safeRelativeDate(event.created_at);
                return (
                  <li key={event.id} className="flex items-start gap-3 text-sm">
                    <EventIcon type={event.event_type} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{meta.label}</p>
                      <p className="text-muted-foreground truncate">
                        <span className="sr-only">Origem: </span>
                        {event.ip_address || '—'} • {event.location || 'Local desconhecido'}
                      </p>
                    </div>
                    {rel && (
                      <time
                        className="text-muted-foreground whitespace-nowrap shrink-0"
                        dateTime={event.created_at}
                      >
                        {rel}
                      </time>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function SecurityRecommendations({
  isEnrolled,
  trustedDevices,
  totalDevices,
  unresolvedAlerts,
}: {
  isEnrolled: boolean;
  trustedDevices: number;
  totalDevices: number;
  unresolvedAlerts: number;
}) {
  const items: Array<{ icon: typeof XCircle; tone: string; text: string }> = [];
  if (!isEnrolled) {
    items.push({
      icon: XCircle,
      tone: 'text-destructive',
      text: 'Ative a autenticação de dois fatores (MFA) para proteger sua conta',
    });
  }
  if (trustedDevices < totalDevices && totalDevices > 0) {
    items.push({
      icon: AlertTriangle,
      tone: 'text-warning',
      text: 'Revise e marque como confiáveis os dispositivos que você reconhece',
    });
  }
  if (unresolvedAlerts > 0) {
    items.push({
      icon: AlertTriangle,
      tone: 'text-warning',
      text: `Você tem ${unresolvedAlerts} alerta(s) pendente(s) para revisar`,
    });
  }

  if (items.length === 0) return null;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-warning">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          Recomendações de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map(({ icon: Icon, tone, text }, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
