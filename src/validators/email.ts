import { z } from 'zod';

export const email = z.string().email('Email inválido');
export const corporateEmail = z.string().email('Email inválido').refine(
  (e) => !e.endsWith('@gmail.com') && !e.endsWith('@hotmail.com'),
  'Use um email corporativo'
);
