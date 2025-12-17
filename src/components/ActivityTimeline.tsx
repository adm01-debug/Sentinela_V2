import { LogIn, LogOut, AppWindow, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityEntry } from '@/data/employeeDetailData';

const activityIcons = {
  login: LogIn,
  logout: LogOut,
  app_open: AppWindow,
  app_close: AppWindow,
  idle_start: Clock,
  idle_end: Clock,
  alert: AlertTriangle,
};

const activityColors = {
  login: 'bg-success/20 text-success',
  logout: 'bg-muted text-muted-foreground',
  app_open: 'bg-info/20 text-info',
  app_close: 'bg-muted text-muted-foreground',
  idle_start: 'bg-warning/20 text-warning',
  idle_end: 'bg-success/20 text-success',
  alert: 'bg-destructive/20 text-destructive',
};

interface ActivityTimelineProps {
  activities: ActivityEntry[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        const isLast = index === activities.length - 1;

        return (
          <div key={activity.id} className="relative flex gap-3">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-[17px] top-10 h-full w-px bg-border" />
            )}
            
            {/* Icon */}
            <div className={cn(
              'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              activityColors[activity.type]
            )}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{activity.description}</p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.details}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
