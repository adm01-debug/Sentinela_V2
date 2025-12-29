export type DateFormat = 'short' | 'medium' | 'long' | 'full' | 'iso' | 'relative';

export interface DateFormatOptions {
  locale?: string;
  timezone?: string;
  format?: DateFormat;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export class DateAdapter {
  private locale: string;
  private timezone: string;

  constructor(options?: DateFormatOptions) {
    this.locale = options?.locale || 'pt-BR';
    this.timezone = options?.timezone || 'America/Sao_Paulo';
  }

  format(date: Date | string | number, format: DateFormat = 'medium'): string {
    const d = new Date(date);
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: this.timezone,
    };

    switch (format) {
      case 'short':
        options.dateStyle = 'short';
        break;
      case 'medium':
        options.dateStyle = 'medium';
        break;
      case 'long':
        options.dateStyle = 'long';
        break;
      case 'full':
        options.dateStyle = 'full';
        options.timeStyle = 'long';
        break;
      case 'iso':
        return d.toISOString();
      case 'relative':
        return this.formatRelative(d);
      default:
        options.dateStyle = 'medium';
    }

    return new Intl.DateTimeFormat(this.locale, options).format(d);
  }

  private formatRelative(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'agora';
  }

  parse(dateString: string): Date {
    return new Date(dateString);
  }

  isValid(date: Date | string | number): boolean {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  diff(date1: Date, date2: Date, unit: 'days' | 'hours' | 'minutes' | 'seconds' = 'days'): number {
    const diff = Math.abs(date1.getTime() - date2.getTime());
    
    switch (unit) {
      case 'seconds':
        return Math.floor(diff / 1000);
      case 'minutes':
        return Math.floor(diff / (1000 * 60));
      case 'hours':
        return Math.floor(diff / (1000 * 60 * 60));
      case 'days':
      default:
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
  }

  setLocale(locale: string): void {
    this.locale = locale;
  }

  setTimezone(timezone: string): void {
    this.timezone = timezone;
  }
}

export const dateAdapter = new DateAdapter();
