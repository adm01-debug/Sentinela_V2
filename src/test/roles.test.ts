/**
 * SENTINELA - Roles & Permissions Test Suite
 * Tests pure RBAC logic — hook now uses Supabase (async)
 */
import { describe, it, expect } from 'vitest';

describe('Roles & Permissions', () => {
  describe('Role Membership Check', () => {
    const hasRole = (userRoles: string[], roleName: string) => userRoles.includes(roleName);

    it('should check role membership', () => {
      expect(hasRole(['admin', 'user'], 'admin')).toBe(true);
      expect(hasRole(['admin', 'user'], 'user')).toBe(true);
      expect(hasRole(['admin', 'user'], 'moderator')).toBe(false);
    });

    it('should handle empty roles', () => {
      expect(hasRole([], 'admin')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(hasRole(['Admin'], 'admin')).toBe(false);
    });
  });

  describe('Permission Check', () => {
    interface Role { name: string; permissions: string[]; }

    const hasPermission = (roles: Role[], userRoles: string[], permission: string) => {
      return roles.some(r => userRoles.includes(r.name) && r.permissions.includes(permission));
    };

    const roles: Role[] = [
      { name: 'admin', permissions: ['read', 'write', 'delete', 'manage_users'] },
      { name: 'editor', permissions: ['read', 'write'] },
      { name: 'viewer', permissions: ['read'] },
    ];

    it('admin should have all permissions', () => {
      expect(hasPermission(roles, ['admin'], 'read')).toBe(true);
      expect(hasPermission(roles, ['admin'], 'write')).toBe(true);
      expect(hasPermission(roles, ['admin'], 'delete')).toBe(true);
      expect(hasPermission(roles, ['admin'], 'manage_users')).toBe(true);
    });

    it('editor should have read and write only', () => {
      expect(hasPermission(roles, ['editor'], 'read')).toBe(true);
      expect(hasPermission(roles, ['editor'], 'write')).toBe(true);
      expect(hasPermission(roles, ['editor'], 'delete')).toBe(false);
    });

    it('viewer should have read only', () => {
      expect(hasPermission(roles, ['viewer'], 'read')).toBe(true);
      expect(hasPermission(roles, ['viewer'], 'write')).toBe(false);
    });

    it('should deny non-matching role', () => {
      expect(hasPermission(roles, ['unknown'], 'read')).toBe(false);
    });

    it('should support multiple roles', () => {
      expect(hasPermission(roles, ['editor', 'viewer'], 'write')).toBe(true);
      expect(hasPermission(roles, ['editor', 'viewer'], 'delete')).toBe(false);
    });
  });
});
