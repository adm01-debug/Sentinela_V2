import { Activity } from '@/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/Table';
import { Badge } from './ui/Badge';
import { Skeleton } from './Skeleton';
import { format } from 'date-fns';

interface Props { activities: Activity[]; isLoading?: boolean; }

export const ActivityTable = ({ activities, isLoading }: Props) => {
  if (isLoading) return <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} height={48} />)}</div>;

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
        {activities.map(a => (
          <TableRow key={a.id}>
            <TableCell>{format(new Date(a.timestamp), 'HH:mm')}</TableCell>
            <TableCell className="font-medium">{a.application}</TableCell>
            <TableCell className="text-muted-foreground">{a.title}</TableCell>
            <TableCell>{Math.round(a.duration / 60)}min</TableCell>
            <TableCell><Badge variant={a.productive ? 'success' : 'secondary'}>{a.productive ? 'Productive' : 'Unproductive'}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};