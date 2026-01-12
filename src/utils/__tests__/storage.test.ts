import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockStorage });

describe('storage utils', () => {
  beforeEach(() => { mockStorage.clear(); });

  it('should set and get item', () => {
    localStorage.setItem('key', 'value');
    expect(localStorage.getItem('key')).toBe('value');
  });

  it('should remove item', () => {
    localStorage.setItem('key', 'value');
    localStorage.removeItem('key');
    expect(localStorage.getItem('key')).toBeNull();
  });

  it('should handle JSON values', () => {
    const data = { name: 'Test', count: 42 };
    localStorage.setItem('json', JSON.stringify(data));
    expect(JSON.parse(localStorage.getItem('json') || '{}')).toEqual(data);
  });

  it('should clear all items', () => {
    localStorage.setItem('a', '1');
    localStorage.setItem('b', '2');
    localStorage.clear();
    expect(localStorage.length).toBe(0);
  });
});
