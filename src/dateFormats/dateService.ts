import { dateFormatter } from './dateFormatter';
import { relativeTime } from './relativeTime';
import { dateParser } from './dateParser';
export class DateService {
  private locale = 'pt-BR';
  setLocale(locale: string): void { this.locale = locale; }
  format(date: Date, format = 'short'): string { return dateFormatter.format(date, format, this.locale); }
  relative(date: Date): string { return relativeTime.format(date, this.locale); }
  parse(dateStr: string, format = 'iso'): Date | null { switch (format) { case 'br': return dateParser.parseBR(dateStr); case 'us': return dateParser.parseUS(dateStr); default: return dateParser.parseISO(dateStr); } }
  now(): Date { return new Date(); }
  today(): Date { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
}
export const dateService = new DateService();
