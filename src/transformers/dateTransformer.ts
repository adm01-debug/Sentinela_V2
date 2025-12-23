import { parseISO, format, isValid } from 'date-fns';

export const dateTransformer = {
  toDate: (value: string | Date): Date => typeof value === 'string' ? parseISO(value) : value,
  toString: (date: Date, pattern = 'yyyy-MM-dd'): string => format(date, pattern),
  toISO: (date: Date): string => date.toISOString(),
  toTimestamp: (date: Date): number => date.getTime(),
  fromTimestamp: (timestamp: number): Date => new Date(timestamp),
  isValidDate: (value: any): boolean => isValid(typeof value === 'string' ? parseISO(value) : value),
};
