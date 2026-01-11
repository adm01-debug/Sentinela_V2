import { describe, it, expect } from 'vitest';
import { hasPermission, getPermissions } from '../permissions';
describe('permissions', () => {
  it('admin has all permissions', () => { expect(hasPermission('admin', 'employees', 'delete')).toBe(true); });
  it('viewer has read only', () => { expect(hasPermission('viewer', 'employees', 'read')).toBe(true); expect(hasPermission('viewer', 'employees', 'write')).toBe(false); });
  it('gets role permissions', () => { const perms = getPermissions('analyst'); expect(perms.reports).toContain('write'); });
});