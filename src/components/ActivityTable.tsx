import { memo } from 'react';
import { Activity } from '@/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid } from 'date-fns';

interface Props {
  activities: Activity[];
  isLoading?: boolean;
}

const formatActivityTime = (timestamp) => {
  const parsed = new Date(timestamp);
  if (!isValid(parsed)) return '--:--';
  return format(parsed, 'HH:mm');
};

const ActivityTableBase = ({ activities, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Application</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((a) => (
          <TableRow key={a.id}>
            <TableCell>{formatActivityTime(a.timestamp)}</TableCell>
            <TableCell className="font-medium">{a.application || 'Unknown app'}</TableCell>
            <TableCell className="text-muted-foreground">{a.title || 'Sem título'}</TableCell>
            <TableCell>{Math.max(0, Math.round((a.duration || 0) / 60))}min</TableCell>
            <TableCell>
              <Badge variant={a.productive ? 'success' : 'secondary'}>
                {a.productive ? 'Productive' : 'Unproductive'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export const ActivityTable = memo(ActivityTableBase);
