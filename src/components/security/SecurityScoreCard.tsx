// ============================================================
// Security Score Card - Header component for UnifiedSecurityPanel
// ============================================================

import React from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Monitor,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Bell,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface SecurityScore {
  total: number;
  mfa: number;
  sessions: number;
  devices: number;
  alerts: number;
}

export function calculateSecurityScore(
  mfaEnabled: boolean,
  trustedDevices: number,
  totalDevices: number,
  unresolvedAlerts: number
): SecurityScore {
  const mfa = mfaEnabled ? 25 : 0;
  const sessions = 25;
  const devices = totalDevices > 0 ? Math.round((trustedDevices / totalDevices) * 25) : 25;
  const alerts = Math.max(0, 25 - unresolvedAlerts * 5);
  return { total: mfa + sessions + devices + alerts, mfa, sessions, devices, alerts };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBadge(score: number): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (score >= 80) return { label: "Excelente", variant: "default" };
  if (score >= 60) return { label: "Bom", variant: "secondary" };
  if (score >= 40) return { label: "Moderado", variant: "outline" };
  return { label: "Crítico", variant: "destructive" };
}

interface SecurityScoreCardProps {
  score: SecurityScore;
  isEnrolled: boolean;
  devicesCount: number;
  trustedDevices: number;
  loginEventsCount: number;
  unresolvedAlerts: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export const SecurityScoreCard = React.memo(function SecurityScoreCard({
  score,
  isEnrolled,
  devicesCount,
  trustedDevices,
  loginEventsCount,
  unresolvedAlerts,
  isLoading,
  onRefresh,
}: SecurityScoreCardProps) {
  const scoreBadge = getScoreBadge(score.total);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Painel de Segurança</CardTitle>
              <CardDescription>Visão geral completa da segurança da sua conta</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Pontuação de Segurança
              </span>
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
                    <p className="font-semibold">{isEnrolled ? "Ativo" : "Inativo"}</p>
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
                    <p className="font-semibold">
                      {devicesCount} ({trustedDevices} confiáveis)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Logins Recentes</p>
                    <p className="font-semibold">{loginEventsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {unresolvedAlerts > 0 ? (
                    <AlertTriangle className="h-8 w-8 text-destructive" />
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
  );
});
