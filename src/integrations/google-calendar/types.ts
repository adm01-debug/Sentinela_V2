export interface CalendarCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: string[];
  location?: string;
}

export interface CalendarConfig {
  calendarId: string;
  syncEnabled: boolean;
  syncInterval: number;
}
