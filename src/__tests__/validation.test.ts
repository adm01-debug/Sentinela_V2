import { describe, it, expect } from 'vitest';
import { loginSchema, employeeSchema } from '../lib/validation/schemas';

describe('validation schemas', () => {
  it('validates login with valid data', () => { expect(loginSchema.safeParse({ email: 'test@test.com', password: 'password123' }).success).toBe(true); });
  it('rejects invalid email', () => { expect(loginSchema.safeParse({ email: 'invalid', password: 'password123' }).success).toBe(false); });
  it('rejects short password', () => { expect(loginSchema.safeParse({ email: 'test@test.com', password: 'short' }).success).toBe(false); });
  it('validates employee', () => { expect(employeeSchema.safeParse({ name: 'John Doe', email: 'john@test.com', department: 'Engineering', role: 'Developer' }).success).toBe(true); });
});