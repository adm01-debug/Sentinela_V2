import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

interface ScheduleEvent {
  date: Date;
  title: string;
  type: "shift" | "meeting" | "deadline" | "holiday";
}

interface ScheduleCalendarProps {
  events: ScheduleEvent[];
  onDateSelect?: (date: Date) => void;
}

export function ScheduleCalendar({ events, onDateSelect }: ScheduleCalendarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          onSelect={(date: Date | undefined) => date && onDateSelect?.(date)}
          modifiers={{ event: events.map(e => e.date) }}
          modifiersStyles={{ event: { backgroundColor: "#e0e7ff", borderRadius: "50%" } }}
        />
        <div className="mt-4 space-y-2">
          {events.slice(0, 5).map((event, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-20 text-muted-foreground">{event.date.toLocaleDateString()}</span>
              <span>{event.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
