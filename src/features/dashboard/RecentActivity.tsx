"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelative } from "@/helpers/date";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "login" | "violation" | "report" | "alert";
  message: string;
  timestamp: string;
}

interface Props {
  activities: ActivityItem[];
}

const icons = {
  login: Activity,
  violation: AlertCircle,
  report: CheckCircle,
  alert: Clock,
};

export function RecentActivity({ activities }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = icons[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
