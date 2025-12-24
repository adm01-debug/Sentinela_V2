export class TimezoneConverter {
  convert(date: Date, fromTz: string, toTz: string): Date { const utc = this.toUTC(date, fromTz); return this.fromUTC(utc, toTz); }
  toUTC(date: Date, timezone: string): Date { const str = date.toLocaleString('en-US', { timeZone: timezone }); return new Date(str + ' UTC'); }
  fromUTC(date: Date, timezone: string): Date { return new Date(date.toLocaleString('en-US', { timeZone: timezone })); }
  formatInTimezone(date: Date, timezone: string, locale = 'pt-BR'): string { return date.toLocaleString(locale, { timeZone: timezone }); }
}
export const timezoneConverter = new TimezoneConverter();
