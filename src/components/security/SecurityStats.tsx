import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SecurityStatsProps { total: number; critical: number; unresolved: number; today: number; }

export const SecurityStats = React.memo(function SecurityStats({ total, critical, unresolved, today }: SecurityStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Críticos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-red-500">{critical}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Não Resolvidos</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-yellow-500">{unresolved}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-blue-500">{today}</div></CardContent>
      </Card>
    </div>
  );
});
