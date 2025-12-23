import { z } from 'zod';

export const requiredString = z.string().min(1, 'Campo obrigatório');
export const optionalString = z.string().optional();
export const requiredNumber = z.number({ required_error: 'Campo obrigatório' });
export const positiveNumber = z.number().positive('Deve ser maior que zero');
export const requiredBoolean = z.boolean();
export const requiredDate = z.date({ required_error: 'Data obrigatória' });
export const uuid = z.string().uuid('ID inválido');
