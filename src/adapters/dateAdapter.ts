import { format, parse, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateAdapter = {
  format: (date: Date | string, pattern = 'dd/MM/yyyy') => format(typeof date === 'string' ? parseISO(date) : date, pattern, { locale: ptBR }),
  parse: (dateStr: string, pattern = 'dd/MM/yyyy') => parse(dateStr, pattern, new Date(), { locale: ptBR }),
  toISO: (date: Date) => date.toISOString(),
  fromISO: (str: string) => parseISO(str),
  isValid: (date: any) => isValid(date),
  now: () => new Date(),
};
