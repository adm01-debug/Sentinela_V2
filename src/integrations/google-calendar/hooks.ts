import { useState, useEffect } from 'react';
import { googleCalendarClient, CalendarEvent } from './client';

export function useGoogleCalendar(credentials: any) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    googleCalendarClient.listEvents().then(data => {
      setEvents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return { events, loading };
}
