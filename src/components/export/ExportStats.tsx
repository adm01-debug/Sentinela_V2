import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

interface ExportStatsProps {
  total: number;
  completed: number;
  failed: number;
  processing: number;
}

export const ExportStats = React.memo(function ExportStats({
  total,
  completed,
  failed,
  processing,
}: ExportStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Exportações</CardTitle>
          <Download className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">Histórico recente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{completed}</div>
          <p className="text-xs text-muted-foreground">Prontas para download</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
          <Loader className="h-4 w-4 text-blue-500 animate-spin" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{processing}</div>
          <p className="text-xs text-muted-foreground">Aguardando conclusão</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Falhas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{failed}</div>
          <p className="text-xs text-muted-foreground">Com erro</p>
        </CardContent>
      </Card>
    </div>
  );
});
