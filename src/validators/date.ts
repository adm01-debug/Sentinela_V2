import { z } from 'zod';
import { isValid, parseISO, isBefore, isAfter } from 'date-fns';

export const isoDate = z.string().refine((v) => isValid(parseISO(v)), 'Data inválida');
export const pastDate = z.date().refine((d) => isBefore(d, new Date()), 'Deve ser data passada');
export const futureDate = z.date().refine((d) => isAfter(d, new Date()), 'Deve ser data futura');
export const dateRange = z.object({
  start: z.date(),
  end: z.date(),
}).refine((d) => isBefore(d.start, d.end), 'Data inicial deve ser antes da final');
