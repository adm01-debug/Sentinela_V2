// ============================================================
// Security Score Card - Header component for UnifiedSecurityPanel
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield, ShieldCheck, ShieldAlert, Monitor, Key, Lock,
  AlertTriangle, CheckCircle2, Activity, Bell, RefreshCw,
} from 'lucide-react';

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
  const alerts = Math.max(0, 25 - (unresolvedAlerts * 5));
  return { total: mfa + sessions + devices + alerts, mfa, sessions, devices, alerts };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  if (score >= 40) return 'text-warning';
  return 'text-destructive';
}

export function getScoreBadge(score: number): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (score >= 80) return { label: 'Excelente', variant: 'default' };
  if (score >= 60) return { label: 'Bom', variant: 'secondary' };
  if (score >= 40) return { label: 'Moderado', variant: 'outline' };
  return { label: 'Crítico', variant: 'destructive' };
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
  score, isEnrolled, devicesCount, trustedDevices,
  loginEventsCount, unresolvedAlerts, isLoading, onRefresh,
}: SecurityScoreCardProps) {
  const scoreBadge = getScoreBadge(score.total);

  return (
    <Card
      className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30"
      role="region"
      aria-label="Painel de segurança"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10" aria-hidden="true">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Painel de Segurança</CardTitle>
              <CardDescription>Visão geral completa da segurança da sua conta</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label={isLoading ? 'Atualizando painel de segurança' : 'Atualizar painel de segurança'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Pontuação de Segurança</span>
              <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
            </div>
            <div className="flex items-baseline gap-4">
              <div
                className={`text-5xl font-bold ${getScoreColor(score.total)}`}
                aria-label={`Pontuação: ${score.total} de 100`}
              >
                {score.total}
              </div>
              <div className="text-sm text-muted-foreground">de 100 pontos</div>
            </div>
            <Progress
              value={score.total}
              className="h-2"
              aria-label={`Pontuação de segurança: ${score.total} de 100`}
            />
            <dl className="grid grid-cols-2 gap-2 pt-2">
              {[
                { icon: Key, label: 'MFA', value: score.mfa },
                { icon: Lock, label: 'Sessões', value: score.sessions },
                { icon: Monitor, label: 'Dispositivos', value: score.devices },
                { icon: Bell, label: 'Alertas', value: score.alerts },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span>{label}: {value}/25</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              icon={isEnrolled ? ShieldCheck : ShieldAlert}
              tone={isEnrolled ? 'text-success' : 'text-warning'}
              label="MFA"
              value={isEnrolled ? 'Ativo' : 'Inativo'}
            />
            <StatTile
              icon={Monitor}
              tone="text-primary"
              label="Dispositivos"
              value={`${devicesCount} (${trustedDevices} confiáveis)`}
            />
            <StatTile
              icon={Activity}
              tone="text-primary"
              label="Logins Recentes"
              value={String(loginEventsCount)}
            />
            <StatTile
              icon={unresolvedAlerts > 0 ? AlertTriangle : CheckCircle2}
              tone={unresolvedAlerts > 0 ? 'text-destructive' : 'text-success'}
              label="Alertas"
              value={`${unresolvedAlerts} pendentes`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

interface StatTileProps {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  tone: string;
  label: string;
  value: string;
}

function StatTile({ icon: Icon, tone, label, value }: StatTileProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className={`h-8 w-8 ${tone}`} aria-hidden="true" />
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
