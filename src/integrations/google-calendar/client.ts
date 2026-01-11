import { google } from 'googleapis';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  attendees?: string[];
}

export class GoogleCalendarClient {
  private calendar;
  
  constructor(credentials: { clientId: string; clientSecret: string; refreshToken: string }) {
    const auth = new google.auth.OAuth2(credentials.clientId, credentials.clientSecret);
    auth.setCredentials({ refresh_token: credentials.refreshToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }
  
  async listEvents(calendarId: string = 'primary', maxResults: number = 10): Promise<CalendarEvent[]> {
    const res = await this.calendar.events.list({ calendarId, maxResults, singleEvents: true, orderBy: 'startTime' });
    return (res.data.items || []).map(e => ({ id: e.id!, summary: e.summary!, start: new Date(e.start?.dateTime || e.start?.date!), end: new Date(e.end?.dateTime || e.end?.date!) }));
  }
  
  async createEvent(calendarId: string, event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const res = await this.calendar.events.insert({ calendarId, requestBody: { summary: event.summary, start: { dateTime: event.start.toISOString() }, end: { dateTime: event.end.toISOString() } } });
    return { id: res.data.id!, ...event };
  }
}
