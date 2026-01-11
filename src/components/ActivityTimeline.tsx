import { useActivityTimeline } from '@/hooks';
import { format } from 'date-fns';
import { Skeleton } from './Skeleton';

interface Props { employeeId: string; date?: string; }

export const ActivityTimeline = ({ employeeId, date = format(new Date(), 'yyyy-MM-dd') }: Props) => {
  const { data: activities, isLoading } = useActivityTimeline(employeeId, date);

  if (isLoading) return <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} height={60} />)}</div>;

  return (
    <div className="space-y-4">
      {activities?.map(activity => (
        <div key={activity.id} className="flex gap-4 p-4 bg-card rounded-lg">
          <div className="w-16 text-sm text-muted-foreground">{format(new Date(activity.timestamp), 'HH:mm')}</div>
          <div>
            <p className="font-medium">{activity.application}</p>
            <p className="text-sm text-muted-foreground">{activity.title}</p>
          </div>
          <div className="ml-auto text-sm">{Math.round(activity.duration / 60)}min</div>
        </div>
      ))}
    </div>
  );
};