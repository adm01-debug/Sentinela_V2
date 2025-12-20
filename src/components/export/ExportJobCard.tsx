import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Trash2, X, FileText, FileSpreadsheet, FileJson, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExportJob {
  id: string;
  type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  file_url: string | null;
  error_message: string | null;
  created_at: string;
  record_count: number | null;
}

interface ExportJobCardProps {
  job: ExportJob;
  onDownload: (url: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatIcons = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  json: FileJson,
  pdf: FileText,
};

const statusColors = {
  pending: 'secondary',
  processing: 'default',
  completed: 'default',
  failed: 'destructive',
} as const;

const statusLabels = {
  pending: 'Aguardando',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
};

const typeLabels: Record<string, string> = {
  employees: 'Funcionários',
  violations: 'Violações',
  activities: 'Atividades',
  reports: 'Relatórios',
};

export const ExportJobCard = React.memo(function ExportJobCard({
  job,
  onDownload,
  onCancel,
  onDelete,
}: ExportJobCardProps) {
  const Icon = formatIcons[job.format as keyof typeof formatIcons] || File;
  const isProcessing = job.status === 'pending' || job.status === 'processing';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">{typeLabels[job.type] || job.type}</h3>
              <p className="text-sm text-muted-foreground uppercase">{job.format}</p>
            </div>
          </div>
          
          <Badge variant={statusColors[job.status]}>
            {statusLabels[job.status]}
          </Badge>
        </div>

        {isProcessing && (
          <div className="mt-4">
            <Progress value={job.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{job.progress}% concluído</p>
          </div>
        )}

        {job.error_message && (
          <p className="mt-2 text-sm text-destructive">{job.error_message}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ptBR })}
            {job.record_count && ` • ${job.record_count} registros`}
          </span>
          
          <div className="flex gap-2">
            {isProcessing && (
              <Button size="sm" variant="outline" onClick={() => onCancel(job.id)}>
                <X className="h-4 w-4" />
              </Button>
            )}
            {job.status === 'completed' && job.file_url && (
              <Button size="sm" onClick={() => onDownload(job.file_url!)}>
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
            )}
            {(job.status === 'completed' || job.status === 'failed') && (
              <Button size="sm" variant="ghost" onClick={() => onDelete(job.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
