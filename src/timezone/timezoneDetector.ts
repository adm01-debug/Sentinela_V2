export class TimezoneDetector {
  detect(): string { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  detectOffset(): number { return -new Date().getTimezoneOffset() / 60; }
  async detectByIP(): Promise<string> { try { const response = await fetch('https://worldtimeapi.org/api/ip'); const data = await response.json(); return data.timezone; } catch { return this.detect(); } }
  isSameTimezone(tz1: string, tz2: string): boolean { const date = new Date(); const d1 = date.toLocaleString('en-US', { timeZone: tz1 }); const d2 = date.toLocaleString('en-US', { timeZone: tz2 }); return d1 === d2; }
}
export const timezoneDetector = new TimezoneDetector();
