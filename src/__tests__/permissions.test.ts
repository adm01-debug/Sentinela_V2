import { describe, it, expect } from 'vitest';
import { hasPermission, getPermissions } from '../lib/permissions';

describe('permissions', () => {
  it('admin has all permissions', () => { expect(hasPermission('admin', 'employees', 'delete')).toBe(true); expect(hasPermission('admin', 'settings', 'write')).toBe(true); });
  it('viewer has read only', () => { expect(hasPermission('viewer', 'employees', 'read')).toBe(true); expect(hasPermission('viewer', 'employees', 'write')).toBe(false); });
  it('manager has limited permissions', () => { expect(hasPermission('manager', 'employees', 'write')).toBe(true); expect(hasPermission('manager', 'users', 'write')).toBe(false); });
});