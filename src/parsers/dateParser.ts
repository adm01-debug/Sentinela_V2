import { parseISO, parse, isValid } from 'date-fns';
export function parseDate(value: string, formats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy']): Date | null {
  const iso = parseISO(value);
  if (isValid(iso)) return iso;
  for (const fmt of formats) { const d = parse(value, fmt, new Date()); if (isValid(d)) return d; }
  return null;
}
export function parseDateStrict(value: string, format: string): Date | null {
  const d = parse(value, format, new Date());
  return isValid(d) ? d : null;
}
