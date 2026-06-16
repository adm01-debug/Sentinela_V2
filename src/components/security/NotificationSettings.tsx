import React from "react";
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { useSecurityNotifications } from "@/hooks/useSecurityNotifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const NotificationSettings = React.memo(function NotificationSettings() {
  const { isSupported, permission, requestPermission } = useSecurityNotifications();

  const getStatusIcon = () => {
    if (!isSupported) return <BellOff className="h-8 w-8 text-muted-foreground" />;
    if (permission === "granted") return <BellRing className="h-8 w-8 text-green-500" />;
    if (permission === "denied") return <XCircle className="h-8 w-8 text-red-500" />;
    return <Bell className="h-8 w-8 text-yellow-500" />;
  };

  const getStatusBadge = () => {
    if (!isSupported) return <Badge variant="secondary">Não suportado</Badge>;
    if (permission === "granted") return <Badge variant="default">Ativo</Badge>;
    if (permission === "denied") return <Badge variant="destructive">Bloqueado</Badge>;
    return <Badge variant="outline">Pendente</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>Receba alertas de segurança em tempo real no navegador</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Card */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <p className="font-medium">Status das Notificações</p>
              <p className="text-sm text-muted-foreground">
                {!isSupported
                  ? "Seu navegador não suporta notificações push"
                  : permission === "granted"
                    ? "Você receberá alertas em tempo real"
                    : permission === "denied"
                      ? "Notificações foram bloqueadas"
                      : "Clique para ativar notificações"}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Permission Request Button */}
        {isSupported && permission !== "granted" && (
          <div className="space-y-4">
            {permission === "denied" ? (
              <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/20">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div className="space-y-2">
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">
                    Notificações bloqueadas
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    Para receber alertas de segurança, você precisa desbloquear as notificações nas
                    configurações do navegador:
                  </p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-yellow-600 dark:text-yellow-500">
                    <li>Clique no ícone de cadeado na barra de endereço</li>
                    <li>Encontre a opção &quot;Notificações&quot;</li>
                    <li>Altere de &quot;Bloquear&quot; para &quot;Permitir&quot;</li>
                    <li>Recarregue a página</li>
                  </ol>
                </div>
              </div>
            ) : (
              <Button onClick={requestPermission} className="w-full" size="lg">
                <BellRing className="mr-2 h-4 w-4" />
                Ativar Notificações Push
              </Button>
            )}
          </div>
        )}

        {/* Notification Types */}
        {permission === "granted" && (
          <div className="space-y-4">
            <h4 className="font-medium">Tipos de Alertas</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Alertas Críticos</p>
                    <p className="text-sm text-muted-foreground">Violações de alta severidade</p>
                  </div>
                </div>
                <Switch defaultChecked disabled />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Alertas de Alta Prioridade</p>
                    <p className="text-sm text-muted-foreground">Tentativas de acesso suspeitas</p>
                  </div>
                </div>
                <Switch defaultChecked disabled />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Novo Dispositivo</p>
                    <p className="text-sm text-muted-foreground">
                      Login de dispositivo desconhecido
                    </p>
                  </div>
                </div>
                <Switch defaultChecked disabled />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Conectado ao sistema de alertas em tempo real</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
