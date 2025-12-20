import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Report { id: string; name: string; type: string; status: string; created_at: string; file_url: string | null; }

const statusColors = { pending: 'secondary', generating: 'default', completed: 'default', failed: 'destructive' } as const;
const typeLabels: Record<string, string> = { productivity: 'Produtividade', violations: 'Violações', attendance: 'Presença', summary: 'Resumo' };

export const ReportCard = React.memo(function ReportCard({ report, onDownload, onDelete }: { report: Report; onDownload: (url: string) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg"><FileText className="h-5 w-5" /></div>
            <div><h3 className="font-medium">{typeLabels[report.type] || report.type}</h3><p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: ptBR })}</p></div>
          </div>
          <Badge variant={statusColors[report.status as keyof typeof statusColors] || 'secondary'}>
            {report.status === 'generating' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            {report.status}
          </Badge>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {report.status === 'completed' && report.file_url && <Button size="sm" onClick={() => onDownload(report.file_url!)}><Download className="h-4 w-4 mr-1" />Baixar</Button>}
          <Button size="sm" variant="ghost" onClick={() => onDelete(report.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
});
