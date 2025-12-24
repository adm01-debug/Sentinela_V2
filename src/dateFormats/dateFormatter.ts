export class DateFormatter {
  format(date: Date, format: string, locale = 'pt-BR'): string { const options: Intl.DateTimeFormatOptions = {}; if (format.includes('full')) { options.dateStyle = 'full'; } else if (format.includes('long')) { options.dateStyle = 'long'; } else if (format.includes('medium')) { options.dateStyle = 'medium'; } else { options.dateStyle = 'short'; } if (format.includes('time')) { options.timeStyle = 'short'; } return new Intl.DateTimeFormat(locale, options).format(date); }
  formatISO(date: Date): string { return date.toISOString(); }
  formatCustom(date: Date, pattern: string): string { return pattern.replace('YYYY', date.getFullYear().toString()).replace('MM', (date.getMonth() + 1).toString().padStart(2, '0')).replace('DD', date.getDate().toString().padStart(2, '0')).replace('HH', date.getHours().toString().padStart(2, '0')).replace('mm', date.getMinutes().toString().padStart(2, '0')).replace('ss', date.getSeconds().toString().padStart(2, '0')); }
}
export const dateFormatter = new DateFormatter();
