import { format } from "date-fns";
import { Skeleton } from "./Skeleton";
import { useActivityTimeline } from "@/hooks";

type TimelineActivity = {
  id: string;
  timestamp: string;
  application: string;
  title: string;
  duration: number;
};

interface Props {
  // New/legacy usage (used by EmployeeDetail page)
  activities?: TimelineActivity[];
  isLoading?: boolean;

  // API-driven usage (kept for compatibility)
  employeeId?: string;
  date?: string;
}

export const ActivityTimeline = ({
  activities: activitiesProp,
  isLoading: isLoadingProp,
  employeeId,
  date = format(new Date(), "yyyy-MM-dd"),
}: Props) => {
  const enabled = !activitiesProp && !!employeeId;
  const { data: activitiesQuery, isLoading: isLoadingQuery } = useActivityTimeline(
    employeeId ?? "",
    date
  );

  const activities = activitiesProp ?? (enabled ? activitiesQuery : []);
  const isLoading = isLoadingProp ?? (enabled ? isLoadingQuery : false);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={60} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities?.map((activity) => (
        <div key={activity.id} className="flex gap-4 rounded-lg bg-card p-4">
          <div className="w-16 text-sm text-muted-foreground">
            {format(new Date(activity.timestamp), "HH:mm")}
          </div>
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
