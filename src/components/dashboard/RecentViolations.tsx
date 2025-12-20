import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Violation { id: string; employee_name: string; type: string; severity: string; created_at: string; }
const severityColors = { low: 'secondary', medium: 'default', high: 'destructive', critical: 'destructive' } as const;

export const RecentViolations = React.memo(function RecentViolations({ violations }: { violations: Violation[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Violações Recentes</CardTitle></CardHeader>
      <CardContent>
        {violations.length === 0 ? <p className="text-muted-foreground text-center py-4">Nenhuma violação recente</p> : (
          <div className="space-y-3">{violations.map(v => (
            <div key={v.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div><p className="font-medium text-sm">{v.employee_name}</p><p className="text-xs text-muted-foreground">{v.type}</p></div>
              <div className="text-right"><Badge variant={severityColors[v.severity as keyof typeof severityColors] || 'secondary'}>{v.severity}</Badge><p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(v.created_at), { addSuffix: true, locale: ptBR })}</p></div>
            </div>
          ))}</div>
        )}
      </CardContent>
    </Card>
  );
});
