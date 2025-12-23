import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date, pattern = 'dd/MM/yyyy') => format(typeof date === 'string' ? parseISO(date) : date, pattern, { locale: ptBR });
export const formatDateTime = (date: string | Date) => formatDate(date, 'dd/MM/yyyy HH:mm');
export const formatTime = (date: string | Date) => formatDate(date, 'HH:mm');
export const formatRelativeDate = (date: string | Date) => formatRelative(typeof date === 'string' ? parseISO(date) : date, new Date(), { locale: ptBR });
export const formatDistanceDate = (date: string | Date) => formatDistance(typeof date === 'string' ? parseISO(date) : date, new Date(), { addSuffix: true, locale: ptBR });
