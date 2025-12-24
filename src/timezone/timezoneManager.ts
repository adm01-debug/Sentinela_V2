export class TimezoneManager {
  private currentTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  get(): string { return this.currentTimezone; }
  set(timezone: string): void { this.currentTimezone = timezone; }
  getOffset(timezone?: string): number { const tz = timezone || this.currentTimezone; const date = new Date(); const utc = date.getTime() + date.getTimezoneOffset() * 60000; const tzDate = new Date(utc + this.getOffsetMs(tz)); return (tzDate.getTime() - utc) / 3600000; }
  private getOffsetMs(timezone: string): number { const date = new Date(); const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' })); const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone })); return tzDate.getTime() - utcDate.getTime(); }
  listCommon(): string[] { return ['America/Sao_Paulo', 'America/New_York', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'UTC']; }
}
export const timezoneManager = new TimezoneManager();
