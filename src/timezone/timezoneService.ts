import { timezoneManager } from './timezoneManager';
import { timezoneConverter } from './timezoneConverter';
import { timezoneDetector } from './timezoneDetector';
export class TimezoneService {
  init(): void { timezoneManager.set(timezoneDetector.detect()); }
  getCurrentTimezone(): string { return timezoneManager.get(); }
  setTimezone(tz: string): void { timezoneManager.set(tz); }
  convertToLocal(date: Date, fromTz: string): Date { return timezoneConverter.convert(date, fromTz, timezoneManager.get()); }
  formatLocal(date: Date, fromTz: string): string { return timezoneConverter.formatInTimezone(this.convertToLocal(date, fromTz), timezoneManager.get()); }
}
export const timezoneService = new TimezoneService();
