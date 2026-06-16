import * as React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  attendees?: number;
  color?: string;
}

export function UpcomingEventsWidget({
  events,
  maxEvents = 5,
  className,
}: {
  events: Event[];
  maxEvents?: number;
  className?: string;
}) {
  const upcoming = events
    .filter((e) => e.startTime > new Date())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, maxEvents);
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No upcoming events</p>
        )}
        {upcoming.map((event) => (
          <div key={event.id} className="flex gap-3 rounded-lg p-2 hover:bg-muted/50">
            <div className={cn("w-1 rounded-full", event.color || "bg-primary")} />
            <div className="flex-1">
              <p className="text-sm font-medium">{event.title}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(event.startTime)} {formatTime(event.startTime)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                )}
                {event.attendees && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.attendees}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
export default UpcomingEventsWidget;
