import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Globe, Activity } from 'lucide-react';

interface RateLimitStatsProps {
  totalRequests: number;
  blockedRequests: number;
  blockedPercentage: string;
  uniqueIPs: number;
}

export const RateLimitStats = React.memo(function RateLimitStats({
  totalRequests,
  blockedRequests,
  blockedPercentage,
  uniqueIPs,
}: RateLimitStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
          <Shield className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{blockedRequests}</div>
          <p className="text-xs text-muted-foreground">{blockedPercentage}% do total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">IPs Únicos</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueIPs}</div>
          <p className="text-xs text-muted-foreground">Endereços distintos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Bloqueio</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{blockedPercentage}%</div>
          <p className="text-xs text-muted-foreground">Requisições bloqueadas</p>
        </CardContent>
      </Card>
    </div>
  );
});
