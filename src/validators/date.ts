import { z } from 'zod';
import { isValid, parseISO, isBefore, isAfter } from 'date-fns';

export const dateStringValidator = z.string().refine(
  val => isValid(parseISO(val)),
  { message: 'Data inválida' }
);

export const futureDateValidator = z.string().refine(
  val => isAfter(parseISO(val), new Date()),
  { message: 'Data deve ser futura' }
);

export const pastDateValidator = z.string().refine(
  val => isBefore(parseISO(val), new Date()),
  { message: 'Data deve ser passada' }
);

export const dateRangeValidator = z.object({
  start: dateStringValidator,
  end: dateStringValidator,
}).refine(
  data => isBefore(parseISO(data.start), parseISO(data.end)),
  { message: 'Data inicial deve ser anterior à final' }
);
