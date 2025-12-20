import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RateLimitLog {
  id: string;
  ip_address: string;
  endpoint: string;
  request_count: number;
  blocked: boolean;
  created_at: string;
}

interface RateLimitLogsTableProps {
  logs: RateLimitLog[];
  isLoading?: boolean;
}

export const RateLimitLogsTable = React.memo(function RateLimitLogsTable({
  logs,
  isLoading,
}: RateLimitLogsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum log encontrado
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>IP</TableHead>
          <TableHead>Endpoint</TableHead>
          <TableHead>Requisições</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-mono">{log.ip_address}</TableCell>
            <TableCell>{log.endpoint}</TableCell>
            <TableCell>{log.request_count}</TableCell>
            <TableCell>
              <Badge variant={log.blocked ? 'destructive' : 'secondary'}>
                {log.blocked ? 'Bloqueado' : 'Permitido'}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(log.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});
