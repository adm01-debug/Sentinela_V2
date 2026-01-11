import { describe, it, expect } from 'vitest';
import { loginSchema, employeeSchema } from '../validation/schemas';
describe('validation schemas', () => {
  it('validates login', () => { expect(loginSchema.safeParse({ email: 'test@test.com', password: 'password123' }).success).toBe(true); });
  it('rejects invalid email', () => { expect(loginSchema.safeParse({ email: 'invalid', password: 'password123' }).success).toBe(false); });
  it('validates employee', () => { expect(employeeSchema.safeParse({ name: 'John', email: 'j@t.com', department: 'Eng', role: 'Dev' }).success).toBe(true); });
});