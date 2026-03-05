// Google Calendar integration stub
// googleapis is a Node.js library, not available in browser

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
}

export const googleCalendarClient = {
  listEvents: async (): Promise<CalendarEvent[]> => {
    console.warn('Google Calendar integration requires server-side implementation');
    return [];
  },
  createEvent: async (event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    console.warn('Google Calendar integration requires server-side implementation');
    return { id: '', summary: '', start: '', end: '', ...event } as CalendarEvent;
  },
};
