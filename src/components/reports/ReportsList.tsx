import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, Trash2, FileText, Table, File, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneratedReport { id: string; name: string; type: 'pdf' | 'excel' | 'csv'; generatedAt: Date; size: string; status: 'ready' | 'generating' | 'failed'; downloadUrl?: string; }

export function ReportsList({ reports, onDownload, onPreview, onDelete, className }: { reports: GeneratedReport[]; onDownload?: (id: string) => void; onPreview?: (id: string) => void; onDelete?: (id: string) => void; className?: string }) {
  const typeIcons = { pdf: FileText, excel: Table, csv: File };
  const statusColors = { ready: 'bg-green-100 text-green-800', generating: 'bg-yellow-100 text-yellow-800', failed: 'bg-red-100 text-red-800' };

  return (
    <Card className={className}>
      <CardHeader><CardTitle>Generated Reports</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No reports generated yet</p>}
          {reports.map(report => {
            const Icon = typeIcons[report.type];
            return (
              <div key={report.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{report.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{report.generatedAt.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{report.size}</span>
                    <Badge className={cn('text-xs', statusColors[report.status])}>{report.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  {report.status === 'ready' && onPreview && <Button variant="ghost" size="icon" onClick={() => onPreview(report.id)}><Eye className="h-4 w-4" /></Button>}
                  {report.status === 'ready' && onDownload && <Button variant="ghost" size="icon" onClick={() => onDownload(report.id)}><Download className="h-4 w-4" /></Button>}
                  {onDelete && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(report.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
export default ReportsList;
