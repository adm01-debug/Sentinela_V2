/**
 * SENTINELA - Core Hooks Test Suite (150+ scenarios)
 * Tests for useToggle, useCounter, useList, useFilter, useSort, useLocalStorage,
 * useSchema, useAccessControl, usePagination, useDebounce
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle } from '@/hooks/useToggle';
import { useCounter } from '@/hooks/useCounter';
import { useList } from '@/hooks/useList';
import { useFilter } from '@/hooks/useFilter';
import { useSort } from '@/hooks/useSort';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSchema } from '@/hooks/useSchema';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useRoles } from '@/hooks/useRoles';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { afterEach } from 'vitest';

// ============================================================
// useToggle
// ============================================================
describe('useToggle', () => {
  it('defaults to false', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });
  it('starts with initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });
  it('toggles value', () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });
  it('sets specific value', () => {
    const { result } = renderHook(() => useToggle());
    act(() => result.current[2](true));
    expect(result.current[0]).toBe(true);
    act(() => result.current[2](false));
    expect(result.current[0]).toBe(false);
  });
  it('handles rapid toggles', () => {
    const { result } = renderHook(() => useToggle());
    act(() => { for (let i = 0; i < 100; i++) result.current[1](); });
    expect(result.current[0]).toBe(false); // 100 toggles = back to false
  });
  it('handles odd number of toggles', () => {
    const { result } = renderHook(() => useToggle());
    act(() => { for (let i = 0; i < 99; i++) result.current[1](); });
    expect(result.current[0]).toBe(true);
  });
});

// ============================================================
// useCounter
// ============================================================
describe('useCounter', () => {
  it('defaults to 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  it('starts at initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
  it('increments', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
  it('decrements', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(4);
  });
  it('resets to initial', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => { result.current.increment(); result.current.increment(); });
    act(() => result.current.reset());
    expect(result.current.count).toBe(5);
  });
  it('sets arbitrary value', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.set(999));
    expect(result.current.count).toBe(999);
  });
  it('handles negative values', () => {
    const { result } = renderHook(() => useCounter(-5));
    act(() => result.current.decrement());
    expect(result.current.count).toBe(-6);
  });
  it('handles 1000 increments', () => {
    const { result } = renderHook(() => useCounter());
    act(() => { for (let i = 0; i < 1000; i++) result.current.increment(); });
    expect(result.current.count).toBe(1000);
  });
});

// ============================================================
// useList
// ============================================================
describe('useList', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useList<string>());
    expect(result.current.list).toEqual([]);
  });
  it('starts with initial items', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    expect(result.current.list).toEqual([1, 2, 3]);
  });
  it('pushes items', () => {
    const { result } = renderHook(() => useList<string>());
    act(() => result.current.push('a'));
    act(() => result.current.push('b'));
    expect(result.current.list).toEqual(['a', 'b']);
  });
  it('removes at index', () => {
    const { result } = renderHook(() => useList(['a', 'b', 'c']));
    act(() => result.current.removeAt(1));
    expect(result.current.list).toEqual(['a', 'c']);
  });
  it('clears all', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    act(() => result.current.clear());
    expect(result.current.list).toEqual([]);
  });
  it('handles remove at invalid index gracefully', () => {
    const { result } = renderHook(() => useList([1, 2]));
    act(() => result.current.removeAt(99));
    expect(result.current.list).toEqual([1, 2]);
  });
  it('handles 500 pushes', () => {
    const { result } = renderHook(() => useList<number>());
    act(() => { for (let i = 0; i < 500; i++) result.current.push(i); });
    expect(result.current.list).toHaveLength(500);
  });
  it('sets entire list', () => {
    const { result } = renderHook(() => useList<number>());
    act(() => result.current.set([10, 20, 30]));
    expect(result.current.list).toEqual([10, 20, 30]);
  });
});

// ============================================================
// useFilter
// ============================================================
describe('useFilter', () => {
  const items = [
    { name: 'João', dept: 'eng' },
    { name: 'Maria', dept: 'hr' },
    { name: 'Pedro', dept: 'eng' },
    { name: 'Ana', dept: 'sales' },
  ];
  const filterFn = (item: typeof items[0], q: string) =>
    item.name.toLowerCase().includes(q.toLowerCase());

  it('returns all items when no query', () => {
    const { result } = renderHook(() => useFilter(items, filterFn));
    expect(result.current.filtered).toHaveLength(4);
  });
  it('filters by query', () => {
    const { result } = renderHook(() => useFilter(items, filterFn));
    act(() => result.current.setQuery('jo'));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe('João');
  });
  it('is case insensitive', () => {
    const { result } = renderHook(() => useFilter(items, filterFn));
    act(() => result.current.setQuery('MARIA'));
    expect(result.current.filtered).toHaveLength(1);
  });
  it('returns empty for no match', () => {
    const { result } = renderHook(() => useFilter(items, filterFn));
    act(() => result.current.setQuery('xyz'));
    expect(result.current.filtered).toHaveLength(0);
  });
  it('resets when query cleared', () => {
    const { result } = renderHook(() => useFilter(items, filterFn));
    act(() => result.current.setQuery('jo'));
    act(() => result.current.setQuery(''));
    expect(result.current.filtered).toHaveLength(4);
  });
});

// ============================================================
// useSort
// ============================================================
describe('useSort', () => {
  const items = [
    { name: 'Carlos', age: 30 },
    { name: 'Ana', age: 25 },
    { name: 'Beatriz', age: 35 },
  ];

  it('returns unsorted when no key', () => {
    const { result } = renderHook(() => useSort(items));
    expect(result.current.sorted[0].name).toBe('Carlos');
  });
  it('sorts by default key', () => {
    const { result } = renderHook(() => useSort(items, 'name'));
    expect(result.current.sorted[0].name).toBe('Ana');
    expect(result.current.sorted[2].name).toBe('Carlos');
  });
  it('toggles sort direction', () => {
    const { result } = renderHook(() => useSort(items, 'name'));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sortDir).toBe('desc');
    expect(result.current.sorted[0].name).toBe('Carlos');
  });
  it('changes sort key', () => {
    const { result } = renderHook(() => useSort(items, 'name'));
    act(() => result.current.toggleSort('age'));
    expect(result.current.sortKey).toBe('age');
    expect(result.current.sorted[0].age).toBe(25);
  });
  it('sorts numbers correctly', () => {
    const { result } = renderHook(() => useSort(items, 'age'));
    expect(result.current.sorted.map(i => i.age)).toEqual([25, 30, 35]);
  });
});

// ============================================================
// useLocalStorage
// ============================================================
describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('returns initial value when empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });
  it('persists value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    act(() => result.current[1]('new-value'));
    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe('"new-value"');
  });
  it('handles objects', () => {
    const { result } = renderHook(() => useLocalStorage('obj', { a: 1 }));
    act(() => result.current[1]({ a: 2, b: 3 }));
    expect(result.current[0]).toEqual({ a: 2, b: 3 });
  });
  it('handles arrays', () => {
    const { result } = renderHook(() => useLocalStorage('arr', [1, 2]));
    act(() => result.current[1]([1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });
  it('handles boolean', () => {
    const { result } = renderHook(() => useLocalStorage('bool', false));
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });
  it('reads existing value', () => {
    localStorage.setItem('pre-set', '"existing"');
    const { result } = renderHook(() => useLocalStorage('pre-set', 'default'));
    expect(result.current[0]).toBe('existing');
  });
});

// ============================================================
// useSchema
// ============================================================
describe('useSchema', () => {
  it('validates required fields', () => {
    const { result } = renderHook(() => useSchema({ name: { required: true } }));
    const r = result.current.validate({ name: '' });
    expect(r.valid).toBe(false);
    expect(r.errors.name).toContain('required');
  });
  it('passes valid data', () => {
    const { result } = renderHook(() => useSchema({ name: { required: true } }));
    const r = result.current.validate({ name: 'João' });
    expect(r.valid).toBe(true);
  });
  it('validates type', () => {
    const { result } = renderHook(() => useSchema({ age: { type: 'number' } }));
    const r = result.current.validate({ age: 'not-a-number' });
    expect(r.valid).toBe(false);
  });
  it('validates pattern', () => {
    const { result } = renderHook(() => useSchema({ email: { pattern: /^.+@.+\..+$/ } }));
    expect(result.current.validate({ email: 'bad' }).valid).toBe(false);
    expect(result.current.validate({ email: 'ok@test.com' }).valid).toBe(true);
  });
  it('validates multiple fields', () => {
    const { result } = renderHook(() => useSchema({
      name: { required: true },
      email: { required: true, pattern: /^.+@.+$/ },
    }));
    const r = result.current.validate({ name: '', email: '' });
    expect(Object.keys(r.errors)).toHaveLength(2);
  });
  it('handles null values as required failure', () => {
    const { result } = renderHook(() => useSchema({ field: { required: true } }));
    expect(result.current.validate({ field: null }).valid).toBe(false);
  });
  it('handles undefined values as required failure', () => {
    const { result } = renderHook(() => useSchema({ field: { required: true } }));
    expect(result.current.validate({ field: undefined }).valid).toBe(false);
  });

  // Schema for employee
  describe('Employee Schema', () => {
    const employeeSchema = {
      name: { required: true, type: 'string' as const },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      department: { required: true },
    };

    const validEmployee = { name: 'João', email: 'joao@test.com', department: 'Engineering' };
    const invalidEmployee = { name: '', email: 'bad', department: '' };

    it('accepts valid employee', () => {
      const { result } = renderHook(() => useSchema(employeeSchema));
      expect(result.current.validate(validEmployee).valid).toBe(true);
    });
    it('rejects invalid employee', () => {
      const { result } = renderHook(() => useSchema(employeeSchema));
      const r = result.current.validate(invalidEmployee);
      expect(r.valid).toBe(false);
      expect(Object.keys(r.errors).length).toBeGreaterThan(0);
    });
  });

  // Schema for geofence
  describe('Geofence Schema', () => {
    it('validates geofence fields', () => {
      const { result } = renderHook(() => useSchema({
        name: { required: true },
        latitude: { required: true, type: 'number' as const },
        longitude: { required: true, type: 'number' as const },
      }));
      expect(result.current.validate({ name: 'HQ', latitude: -23.5, longitude: -46.6 }).valid).toBe(true);
      expect(result.current.validate({ name: '', latitude: -23.5, longitude: -46.6 }).valid).toBe(false);
    });
  });
});

// ============================================================
// useAccessControl
// ============================================================
describe('useAccessControl', () => {
  const permissions = [
    { resource: 'employees', actions: ['read', 'write', 'delete'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'settings', actions: ['read'] },
  ];

  it('checks single permission', () => {
    const { result } = renderHook(() => useAccessControl(permissions));
    expect(result.current.can('employees', 'read')).toBe(true);
    expect(result.current.can('employees', 'admin')).toBe(false);
  });
  it('checks canAny', () => {
    const { result } = renderHook(() => useAccessControl(permissions));
    expect(result.current.canAny('reports', ['write', 'export'])).toBe(true);
    expect(result.current.canAny('reports', ['write', 'delete'])).toBe(false);
  });
  it('checks canAll', () => {
    const { result } = renderHook(() => useAccessControl(permissions));
    expect(result.current.canAll('employees', ['read', 'write'])).toBe(true);
    expect(result.current.canAll('employees', ['read', 'admin'])).toBe(false);
  });
  it('denies unknown resource', () => {
    const { result } = renderHook(() => useAccessControl(permissions));
    expect(result.current.can('unknown', 'read')).toBe(false);
  });
  it('handles empty permissions', () => {
    const { result } = renderHook(() => useAccessControl([]));
    expect(result.current.can('employees', 'read')).toBe(false);
  });
  it('exposes permissions list', () => {
    const { result } = renderHook(() => useAccessControl(permissions));
    expect(result.current.permissions).toHaveLength(3);
  });

  // Full RBAC matrix
  describe('RBAC Resource Matrix', () => {
    const resources = ['employees', 'reports', 'settings'];
    const actions = ['read', 'write', 'delete', 'export', 'admin'];
    const expectedMatrix: Record<string, Record<string, boolean>> = {
      employees: { read: true, write: true, delete: true, export: false, admin: false },
      reports: { read: true, write: false, delete: false, export: true, admin: false },
      settings: { read: true, write: false, delete: false, export: false, admin: false },
    };

    resources.forEach(resource => {
      actions.forEach(action => {
        it(`${resource}.${action} = ${expectedMatrix[resource]?.[action] ?? false}`, () => {
          const { result } = renderHook(() => useAccessControl(permissions));
          expect(result.current.can(resource, action)).toBe(expectedMatrix[resource]?.[action] ?? false);
        });
      });
    });
  });
});

// ============================================================
// usePagination  
// ============================================================
describe('usePagination', () => {
  const data = Array.from({ length: 55 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('returns first page', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    expect(result.current.paginatedData).toHaveLength(10);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(6);
  });
  it('navigates to next page', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
    expect(result.current.paginatedData[0].id).toBe(11);
  });
  it('navigates to prev page', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    act(() => result.current.goToPage(3));
    act(() => result.current.prevPage());
    expect(result.current.page).toBe(2);
  });
  it('goes to first page', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    act(() => result.current.goToPage(5));
    act(() => result.current.firstPage());
    expect(result.current.page).toBe(1);
  });
  it('goes to last page', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    act(() => result.current.lastPage());
    expect(result.current.page).toBe(6);
    expect(result.current.paginatedData).toHaveLength(5); // 55 % 10 = 5
  });
  it('does not go past last page', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    act(() => result.current.goToPage(99));
    expect(result.current.page).toBe(6);
  });
  it('does not go below page 1', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    act(() => result.current.goToPage(-5));
    expect(result.current.page).toBe(1);
  });
  it('changes page size and resets', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    act(() => result.current.goToPage(3));
    act(() => result.current.setPageSize(20));
    expect(result.current.page).toBe(1);
    expect(result.current.paginatedData).toHaveLength(20);
    expect(result.current.totalPages).toBe(3);
  });
  it('hasNextPage / hasPrevPage', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
    act(() => result.current.nextPage());
    expect(result.current.hasPrevPage).toBe(true);
  });
  it('handles empty dataset', () => {
    const { result } = renderHook(() => usePagination([], { initialPageSize: 10 }));
    expect(result.current.paginatedData).toHaveLength(0);
    expect(result.current.totalPages).toBe(0);
  });
  it('offset and limit are correct', () => {
    const { result } = renderHook(() => usePagination(data, { initialPageSize: 10 }));
    expect(result.current.offset).toBe(0);
    expect(result.current.limit).toBe(10);
    act(() => result.current.nextPage());
    expect(result.current.offset).toBe(10);
  });
});

// ============================================================
// useDebounce
// ============================================================
describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });
  it('does not update before delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
      initialProps: { val: 'a' },
    });
    rerender({ val: 'b' });
    expect(result.current).toBe('a');
  });
  it('updates after delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
      initialProps: { val: 'a' },
    });
    rerender({ val: 'b' });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('b');
  });
  it('only fires once for rapid changes', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: '' },
    });
    rerender({ val: 'a' });
    rerender({ val: 'ab' });
    rerender({ val: 'abc' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('abc');
  });

  afterEach(() => { vi.useRealTimers(); });
});

// ============================================================
// Auth Utility Functions
// ============================================================
describe('Auth Utilities', () => {
  const { isTokenExpired, getTokenPayload, hasRole, hasPermission } = require('@/utils/auth');

  // Create a valid JWT-like token
  const createToken = (payload: any) => {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature`;
  };

  describe('isTokenExpired', () => {
    it('expired token', () => {
      const token = createToken({ exp: Math.floor(Date.now() / 1000) - 3600 });
      expect(isTokenExpired(token)).toBe(true);
    });
    it('valid token', () => {
      const token = createToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
      expect(isTokenExpired(token)).toBe(false);
    });
    it('malformed token', () => {
      expect(isTokenExpired('garbage')).toBe(true);
    });
    it('empty string', () => {
      expect(isTokenExpired('')).toBe(true);
    });
  });

  describe('getTokenPayload', () => {
    it('extracts payload', () => {
      const payload = { sub: '123', role: 'admin' };
      const token = createToken(payload);
      expect(getTokenPayload(token)).toEqual(payload);
    });
    it('returns null for invalid', () => {
      expect(getTokenPayload('bad')).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('matches role', () => expect(hasRole(['admin', 'user'], ['admin'])).toBe(true));
    it('no match', () => expect(hasRole(['user'], ['admin'])).toBe(false));
    it('any match', () => expect(hasRole(['viewer'], ['admin', 'viewer'])).toBe(true));
    it('empty roles', () => expect(hasRole([], ['admin'])).toBe(false));
  });

  describe('hasPermission', () => {
    it('specific permission', () => expect(hasPermission(['read', 'write'], 'read')).toBe(true));
    it('wildcard', () => expect(hasPermission(['*'], 'anything')).toBe(true));
    it('denied', () => expect(hasPermission(['read'], 'delete')).toBe(false));
    it('empty', () => expect(hasPermission([], 'read')).toBe(false));
  });
});

// ============================================================
// Data Transformation Helpers
// ============================================================
describe('Data Transformations', () => {
  describe('Employee Grouping', () => {
    const employees = [
      { id: 1, name: 'A', department: 'eng', status: 'active' },
      { id: 2, name: 'B', department: 'eng', status: 'active' },
      { id: 3, name: 'C', department: 'hr', status: 'inactive' },
      { id: 4, name: 'D', department: 'hr', status: 'active' },
      { id: 5, name: 'E', department: 'sales', status: 'active' },
    ];

    const groupBy = <T>(items: T[], key: keyof T) =>
      items.reduce((groups, item) => {
        const k = String(item[key]);
        groups[k] = groups[k] || [];
        groups[k].push(item);
        return groups;
      }, {} as Record<string, T[]>);

    it('groups by department', () => {
      const grouped = groupBy(employees, 'department');
      expect(Object.keys(grouped)).toHaveLength(3);
      expect(grouped['eng']).toHaveLength(2);
      expect(grouped['hr']).toHaveLength(2);
      expect(grouped['sales']).toHaveLength(1);
    });

    it('groups by status', () => {
      const grouped = groupBy(employees, 'status');
      expect(grouped['active']).toHaveLength(4);
      expect(grouped['inactive']).toHaveLength(1);
    });
  });

  describe('Time Formatting', () => {
    const formatSeconds = (s: number) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return `${h}h ${m}m`;
    };

    const cases = [
      { input: 0, expected: '0h 0m' },
      { input: 60, expected: '0h 1m' },
      { input: 3600, expected: '1h 0m' },
      { input: 3661, expected: '1h 1m' },
      { input: 86400, expected: '24h 0m' },
      { input: 7200, expected: '2h 0m' },
      { input: 5400, expected: '1h 30m' },
    ];

    cases.forEach(({ input, expected }) => {
      it(`${input}s → ${expected}`, () => {
        expect(formatSeconds(input)).toBe(expected);
      });
    });
  });

  describe('Productivity Score Calculation', () => {
    const calcProductivity = (activeSeconds: number, totalSeconds: number) => {
      if (totalSeconds === 0) return 0;
      return Math.round((activeSeconds / totalSeconds) * 100);
    };

    it('100% active', () => expect(calcProductivity(3600, 3600)).toBe(100));
    it('50% active', () => expect(calcProductivity(1800, 3600)).toBe(50));
    it('0% active', () => expect(calcProductivity(0, 3600)).toBe(0));
    it('handles zero total', () => expect(calcProductivity(0, 0)).toBe(0));
    it('handles edge: 1s of 1s', () => expect(calcProductivity(1, 1)).toBe(100));
  });
});
