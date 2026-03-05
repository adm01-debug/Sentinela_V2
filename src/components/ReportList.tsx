import { Report } from '@/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { format } from 'date-fns';
import { reportService } from '@/services';

interface Props { reports: Report[]; isLoading?: boolean; }

const statusVariants: Record<string, 'default' | 'warning' | 'success' | 'destructive'> = { pending: 'default', generating: 'warning', completed: 'success', failed: 'destructive' };

export const ReportList = ({ reports, isLoading }: Props) => {
  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} height={48} />)}</div>;

  const handleDownload = async (id: string) => {
    const blob = await reportService.download(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.' + reports.find(r => r.id === id)?.format;
    a.click();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map(r => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>{r.type}</TableCell>
            <TableCell><Badge variant={statusVariants[r.status]}>{r.status}</Badge></TableCell>
            <TableCell>{format(new Date(r.created_at), 'MMM dd, yyyy')}</TableCell>
            <TableCell>
              {r.status === 'completed' && <Button variant="ghost" size="sm" onClick={() => handleDownload(r.id)}><Download className="h-4 w-4" /></Button>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};