// ============================================================
// UNIFIED SECURITY PANEL - Refactored with sub-components
// ============================================================

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Lock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Activity,
  Eye,
  Bell,
  Key,
  Monitor,
  MapPin,
  Globe,
  Fingerprint,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Sub-components
import { SecurityScoreCard, calculateSecurityScore } from "./SecurityScoreCard";
import { SessionHistoryTab, type LoginEvent } from "./SessionHistoryTab";
import { SecurityAlertsTab } from "./SecurityAlertsTab";
import { MFAStatusTab } from "./MFAStatusTab";
import { KnownDevicesPanel } from "./KnownDevicesPanel";
import { NotificationSettings } from "./NotificationSettings";
import { WebAuthnSettings } from "./WebAuthnSettings";
import { IPWhitelistManager } from "./IPWhitelistManager";
import { GeoBlockingManager } from "./GeoBlockingManager";
import { queryKeys, queryPresets } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlockedIPs } from "@/hooks/useBlockedIPs";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useMFA } from "@/hooks/useMFA";
import { supabase } from "@/integrations/supabase/client";

// ============================================================
// TYPES
// ============================================================

interface MonitoringSetting {
  setting_key: string;
  setting_value: unknown;
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

// ============================================================
// MAIN COMPONENT (~200 lines vs original 726)
// ============================================================

export const UnifiedSecurityPanel = React.memo(function UnifiedSecurityPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { isEnrolled, factors, loading: mfaLoading, checkMFAStatus } = useMFA();
  const { getKnownDevices, getLoginEvents } = useDeviceDetection();
  const { data: blockedIPs } = useBlockedIPs();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const {
    data: devices = [],
    isLoading: devicesLoading,
    refetch: refetchDevices,
  } = useQuery({
    queryKey: ["security", "devices", userId],
    queryFn: () => (userId ? getKnownDevices(userId) : Promise.resolve([])),
    enabled: !!userId,
    ...queryPresets.config,
  });

  const {
    data: loginEvents = [],
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ["security", "loginEvents", userId],
    queryFn: () => (userId ? getLoginEvents(userId, 20) : Promise.resolve([])),
    enabled: !!userId,
    ...queryPresets.config,
  });

  const {
    data: alerts = [],
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: queryKeys.security.events(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_violations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    ...queryPresets.list,
  });

  const { data: settings } = useQuery({
    queryKey: queryKeys.security.settings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monitoring_settings")
        .select("*")
        .in("setting_key", ["mfa_required", "ip_whitelist_enabled", "session_timeout_hours"]);
      if (error) throw error;
      return {
        mfa_required:
          data?.find((s: MonitoringSetting) => s.setting_key === "mfa_required")?.setting_value ===
          true,
        ip_whitelist_enabled:
          data?.find((s: MonitoringSetting) => s.setting_key === "ip_whitelist_enabled")
            ?.setting_value === true,
        session_timeout:
          (data?.find((s: MonitoringSetting) => s.setting_key === "session_timeout_hours")
            ?.setting_value as number) || 24,
      };
    },
  });

  const trustedDevices = Array.isArray(devices)
    ? devices.filter((d: KnownDevice) => d.is_trusted).length
    : 0;
  const unresolvedAlerts = Array.isArray(alerts)
    ? alerts.filter((a: SecurityAlert) => !a.read).length
    : 0;
  const score = calculateSecurityScore(
    isEnrolled,
    trustedDevices,
    Array.isArray(devices) ? devices.length : 0,
    unresolvedAlerts
  );
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
        devicesCount={Array.isArray(devices) ? devices.length : 0}
        trustedDevices={trustedDevices}
        loginEventsCount={Array.isArray(loginEvents) ? loginEvents.length : 0}
        unresolvedAlerts={unresolvedAlerts}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview" className="gap-1 text-xs sm:text-sm">
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="mfa" className="gap-1 text-xs sm:text-sm">
            <Key className="h-4 w-4" />
            <span className="hidden md:inline">MFA</span>
          </TabsTrigger>
          <TabsTrigger value="passkeys" className="gap-1 text-xs sm:text-sm">
            <Fingerprint className="h-4 w-4" />
            <span className="hidden md:inline">Passkeys</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-1 text-xs sm:text-sm">
            <Monitor className="h-4 w-4" />
            <span className="hidden md:inline">Dispositivos</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1 text-xs sm:text-sm">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Sessões</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1 text-xs sm:text-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="whitelist" className="gap-1 text-xs sm:text-sm">
            <MapPin className="h-4 w-4" />
            <span className="hidden md:inline">IP Whitelist</span>
          </TabsTrigger>
          <TabsTrigger value="geo" className="gap-1 text-xs sm:text-sm">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">Geo</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1 text-xs sm:text-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Push</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <OverviewSettingsCard settings={settings} blockedIPsCount={blockedIPs?.length ?? 0} />
            <OverviewActivityCard loginEvents={loginEvents as LoginEvent[]} />
          </div>
          {score.total < 100 && (
            <SecurityRecommendations
              isEnrolled={isEnrolled}
              trustedDevices={trustedDevices}
              totalDevices={Array.isArray(devices) ? devices.length : 0}
              unresolvedAlerts={unresolvedAlerts}
            />
          )}
        </TabsContent>

        <TabsContent value="mfa">
          <MFAStatusTab isEnrolled={isEnrolled} factors={Array.isArray(factors) ? factors : []} />
        </TabsContent>
        <TabsContent value="passkeys">
          <WebAuthnSettings />
        </TabsContent>
        <TabsContent value="devices">{userId && <KnownDevicesPanel />}</TabsContent>
        <TabsContent value="sessions">
          <SessionHistoryTab loginEvents={loginEvents as LoginEvent[]} />
        </TabsContent>
        <TabsContent value="alerts">
          <SecurityAlertsTab alerts={Array.isArray(alerts) ? alerts : []} />
        </TabsContent>
        <TabsContent value="whitelist">
          <IPWhitelistManager />
        </TabsContent>
        <TabsContent value="geo">
          <GeoBlockingManager />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
});

// ============================================================
// Small inline sub-components for overview tab
// ============================================================

function OverviewSettingsCard({
  settings,
  blockedIPsCount,
}: {
  settings?: { mfa_required: boolean; ip_whitelist_enabled: boolean; session_timeout: number };
  blockedIPsCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5" />
          Configurações de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <span>MFA Obrigatório</span>
          <Badge variant={settings?.mfa_required ? "default" : "secondary"}>
            {settings?.mfa_required ? "Sim" : "Não"}
          </Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between py-2">
          <span>Whitelist de IP</span>
          <Badge variant={settings?.ip_whitelist_enabled ? "default" : "secondary"}>
            {settings?.ip_whitelist_enabled ? "Ativo" : "Inativo"}
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
          <Badge variant={blockedIPsCount > 0 ? "destructive" : "secondary"}>
            {blockedIPsCount}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewActivityCard({ loginEvents }: { loginEvents: LoginEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {loginEvents.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">Nenhum evento recente</p>
          ) : (
            <div className="space-y-3">
              {loginEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <div
                    className={`mt-1 rounded-full p-1 ${
                      event.event_type === "login_success"
                        ? "bg-green-100 text-green-600"
                        : event.event_type === "login_failed"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {event.event_type === "login_success" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : event.event_type === "login_failed" ? (
                      <XCircle className="h-3 w-3" />
                    ) : (
                      <Activity className="h-3 w-3" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {event.event_type === "login_success"
                        ? "Login bem-sucedido"
                        : event.event_type === "login_failed"
                          ? "Tentativa de login falhou"
                          : event.event_type === "new_device"
                            ? "Novo dispositivo detectado"
                            : event.event_type}
                    </p>
                    <p className="truncate text-muted-foreground">
                      {event.ip_address} • {event.location || "Local desconhecido"}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              ))}
            </div>
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
  return (
    <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-yellow-700 dark:text-yellow-400">
          <AlertTriangle className="h-5 w-5" />
          Recomendações de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {!isEnrolled && (
            <li className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-destructive" />
              <span>Ative a autenticação de dois fatores (MFA) para proteger sua conta</span>
            </li>
          )}
          {trustedDevices < totalDevices && totalDevices > 0 && (
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
  );
}
