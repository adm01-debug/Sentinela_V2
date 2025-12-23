import { z } from 'zod';

export const emailValidator = z.string().email('Email inválido').toLowerCase().trim();

export const corporateEmailValidator = z.string().email('Email inválido').refine(
  (email) => !['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'].includes(email.split('@')[1]),
  { message: 'Use um email corporativo' }
);
