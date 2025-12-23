import { format, formatDistance, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
export function dateFormat(value: string | Date, pattern = 'dd/MM/yyyy'): string { const d = typeof value === 'string' ? parseISO(value) : value; return format(d, pattern, { locale: ptBR }); }
export function dateRelative(value: string | Date): string { const d = typeof value === 'string' ? parseISO(value) : value; return formatDistance(d, new Date(), { addSuffix: true, locale: ptBR }); }
export function dateTime(value: string | Date): string { return dateFormat(value, 'dd/MM/yyyy HH:mm'); }
