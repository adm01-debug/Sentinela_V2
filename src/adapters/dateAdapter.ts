import { format, parseISO, formatDistance, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DateAdapter {
  format(date: Date | string, pattern?: string): string;
  parse(dateString: string): Date;
  formatRelative(date: Date | string): string;
  isValid(date: any): boolean;
}

export const dateAdapter: DateAdapter = {
  format: (date, pattern = 'dd/MM/yyyy') => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern, { locale: ptBR });
  },
  parse: (dateString) => parseISO(dateString),
  formatRelative: (date) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(d, new Date(), { addSuffix: true, locale: ptBR });
  },
  isValid: (date) => isValid(typeof date === 'string' ? parseISO(date) : date),
};
