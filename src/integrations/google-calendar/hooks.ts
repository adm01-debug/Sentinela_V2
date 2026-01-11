import { useState, useEffect } from 'react';
import { GoogleCalendarClient, CalendarEvent } from './client';

export function useGoogleCalendar(credentials: any) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const client = new GoogleCalendarClient(credentials);
    setLoading(true);
    client.listEvents().then(setEvents).finally(() => setLoading(false));
  }, []);
  
  return { events, loading };
}
