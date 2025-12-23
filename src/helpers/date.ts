import { format, addDays, subDays, startOfDay, endOfDay, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateHelpers = {
  format: (date: Date, pattern = 'dd/MM/yyyy'): string => format(date, pattern, { locale: ptBR }),
  addDays: (date: Date, days: number): Date => addDays(date, days),
  subDays: (date: Date, days: number): Date => subDays(date, days),
  startOfDay: (date: Date): Date => startOfDay(date),
  endOfDay: (date: Date): Date => endOfDay(date),
  isToday: (date: Date): boolean => isToday(date),
  isYesterday: (date: Date): boolean => isYesterday(date),
  daysDiff: (a: Date, b: Date): number => differenceInDays(a, b),
  now: (): Date => new Date(),
};
