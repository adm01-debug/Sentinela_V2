// ============================================================
// VALIDATORS SCHEMA TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import { 
  EmployeeCreateSchema, 
  AuthLoginSchema, 
  TeamCreateSchema 
} from '@/validators/schemas';

describe('EmployeeCreateSchema', () => {
  it('validates correct employee data', () => {
    const result = EmployeeCreateSchema.safeParse({
      name: 'João Silva',
      email: 'joao@empresa.com',
      department: 'TI',
      position: 'Developer',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = EmployeeCreateSchema.safeParse({
      name: '',
      email: 'joao@empresa.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = EmployeeCreateSchema.safeParse({
      name: 'João',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('allows optional fields to be omitted', () => {
    const result = EmployeeCreateSchema.safeParse({
      name: 'João Silva',
    });
    expect(result.success).toBe(true);
  });
});

describe('AuthLoginSchema', () => {
  it('validates correct login', () => {
    const result = AuthLoginSchema.safeParse({
      email: 'user@test.com',
      password: 'strongpass123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = AuthLoginSchema.safeParse({
      email: 'user@test.com',
      password: '123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = AuthLoginSchema.safeParse({
      email: 'not-email',
      password: 'strongpass123',
    });
    expect(result.success).toBe(false);
  });
});

describe('TeamCreateSchema', () => {
  it('validates correct team', () => {
    const result = TeamCreateSchema.safeParse({
      name: 'Dev Team',
      description: 'Engineering team',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = TeamCreateSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });
});
