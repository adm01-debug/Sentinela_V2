import { format, addDays, addMonths, startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

export const dateHelpers = {
  today: (): Date => startOfDay(new Date()),
  now: (): Date => new Date(),
  tomorrow: (): Date => addDays(startOfDay(new Date()), 1),
  yesterday: (): Date => addDays(startOfDay(new Date()), -1),
  startOfToday: (): Date => startOfDay(new Date()),
  endOfToday: (): Date => endOfDay(new Date()),
  startOfThisMonth: (): Date => startOfMonth(new Date()),
  endOfThisMonth: (): Date => endOfMonth(new Date()),
  addDays: (date: Date, days: number): Date => addDays(date, days),
  addMonths: (date: Date, months: number): Date => addMonths(date, months),
  daysBetween: (start: Date, end: Date): number => differenceInDays(end, start),
  format: (date: Date, pattern = 'dd/MM/yyyy'): string => format(date, pattern),
};
