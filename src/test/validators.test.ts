// ============================================================
// VALIDATORS SCHEMA TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import { 
  employeeCreateSchema, 
  loginSchema, 
  teamCreateSchema 
} from '@/validators/schemas';

describe('employeeCreateSchema', () => {
  it('validates correct employee data', () => {
    const result = employeeCreateSchema.safeParse({
      name: 'João Silva',
      email: 'joao@empresa.com',
      department: 'TI',
      position: 'Developer',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = employeeCreateSchema.safeParse({
      name: '',
      email: 'joao@empresa.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = employeeCreateSchema.safeParse({
      name: 'João',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('allows optional fields to be omitted', () => {
    const result = employeeCreateSchema.safeParse({
      name: 'João Silva',
    });
    expect(result.success).toBe(true);
  });
});

describe('loginSchema', () => {
  it('validates correct login', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: 'strongpass123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-email',
      password: 'strongpass123',
    });
    expect(result.success).toBe(false);
  });
});

describe('teamCreateSchema', () => {
  it('validates correct team', () => {
    const result = teamCreateSchema.safeParse({
      name: 'Dev Team',
      description: 'Engineering team',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = teamCreateSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });
});
