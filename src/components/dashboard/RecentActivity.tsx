import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity { id: string; type: string; description: string; created_at: string; }

export const RecentActivity = React.memo(function RecentActivity({ activities }: { activities: Activity[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Atividade Recente</CardTitle></CardHeader>
      <CardContent>
        {activities.length === 0 ? <p className="text-muted-foreground text-center py-4">Nenhuma atividade</p> : (
          <div className="space-y-3">{activities.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div><p className="text-sm">{a.description}</p><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ptBR })}</p></div>
            </div>
          ))}</div>
        )}
      </CardContent>
    </Card>
  );
});
