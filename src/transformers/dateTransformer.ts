import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateTransformer = {
  toDate: (value: string | Date): Date => typeof value === 'string' ? parseISO(value) : value,
  toString: (date: Date, pattern = 'dd/MM/yyyy'): string => format(date, pattern, { locale: ptBR }),
  toISO: (date: Date): string => date.toISOString(),
  toTimestamp: (date: Date): number => date.getTime(),
  fromTimestamp: (ts: number): Date => new Date(ts),
};
