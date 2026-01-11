import { describe, it, expect } from 'vitest';
import { hasRole, hasPermission } from '../auth';
describe('auth', () => {
  it('checks role', () => { expect(hasRole(['admin', 'user'], ['admin'])).toBe(true); expect(hasRole(['user'], ['admin'])).toBe(false); });
  it('checks permission', () => { expect(hasPermission(['read', 'write'], 'read')).toBe(true); expect(hasPermission(['*'], 'anything')).toBe(true); });
});