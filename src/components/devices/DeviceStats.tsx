import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';

interface DeviceStatsProps {
  total: number;
  active: number;
  desktop: number;
  mobile: number;
  needsUpdate: number;
}

export const DeviceStats = React.memo(function DeviceStats({
  total,
  active,
  desktop,
  mobile,
  needsUpdate,
}: DeviceStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Dispositivos</CardTitle>
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            {desktop} desktop, {mobile} mobile
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{active}</div>
          <p className="text-xs text-muted-foreground">
            {total > 0 ? ((active / total) * 100).toFixed(0) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Desktop</CardTitle>
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{desktop}</div>
          <p className="text-xs text-muted-foreground">Computadores</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Precisam Atualização</CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{needsUpdate}</div>
          <p className="text-xs text-muted-foreground">Versão desatualizada</p>
        </CardContent>
      </Card>
    </div>
  );
});
