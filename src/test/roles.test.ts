/**
 * SENTINELA - Roles & Permissions Test Suite
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoles } from '@/hooks/useRoles';

describe('Roles & Permissions', () => {
  describe('useRoles Hook', () => {
    it('should check role membership', () => {
      const { result } = renderHook(() => useRoles(['admin', 'user']));
      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('user')).toBe(true);
      expect(result.current.hasRole('moderator')).toBe(false);
    });

    it('should handle empty roles', () => {
      const { result } = renderHook(() => useRoles([]));
      expect(result.current.hasRole('admin')).toBe(false);
    });

    it('should add roles with permissions', () => {
      const { result } = renderHook(() => useRoles(['admin']));
      act(() => {
        result.current.addRole('admin', ['read', 'write', 'delete']);
      });
      expect(result.current.roles).toHaveLength(1);
      expect(result.current.roles[0].permissions).toContain('write');
    });

    it('should check permissions correctly', () => {
      const { result } = renderHook(() => useRoles(['admin']));
      act(() => { result.current.addRole('admin', ['read', 'write', 'delete']); });
      expect(result.current.hasPermission('read')).toBe(true);
      expect(result.current.hasPermission('write')).toBe(true);
      expect(result.current.hasPermission('superadmin')).toBe(false);
    });

    it('should deny permissions for non-matching roles', () => {
      const { result } = renderHook(() => useRoles(['viewer']));
      act(() => { result.current.addRole('admin', ['read', 'write', 'delete']); });
      expect(result.current.hasPermission('write')).toBe(false);
    });

    it('should support multiple roles with different permissions', () => {
      const { result } = renderHook(() => useRoles(['editor', 'viewer']));
      act(() => {
        result.current.addRole('editor', ['read', 'write']);
        result.current.addRole('viewer', ['read']);
      });
      expect(result.current.hasPermission('read')).toBe(true);
      expect(result.current.hasPermission('write')).toBe(true);
      expect(result.current.hasPermission('delete')).toBe(false);
    });
  });
});
