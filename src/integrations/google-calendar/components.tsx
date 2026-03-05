import React from 'react';
import { useGoogleCalendar } from './hooks';

export function CalendarWidget({ credentials }: { credentials: any }) {
  const { events, loading } = useGoogleCalendar(credentials);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="calendar-widget">
      <h3>Upcoming Events</h3>
      <ul>
        {events.map(e => (
          <li key={e.id}>{e.summary} - {String(e.start)}</li>
        ))}
      </ul>
    </div>
  );
}
