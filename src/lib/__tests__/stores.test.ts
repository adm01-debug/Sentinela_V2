import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('stores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should store data in localStorage', () => {
    localStorage.setItem('test', JSON.stringify({ value: 'test' }));
    const stored = JSON.parse(localStorage.getItem('test') || '{}');
    expect(stored.value).toBe('test');
  });

  it('should retrieve data from localStorage', () => {
    localStorage.setItem('key', 'value');
    expect(localStorage.getItem('key')).toBe('value');
  });

  it('should remove data from localStorage', () => {
    localStorage.setItem('temp', 'data');
    localStorage.removeItem('temp');
    expect(localStorage.getItem('temp')).toBeNull();
  });

  it('should store data in sessionStorage', () => {
    sessionStorage.setItem('session', 'data');
    expect(sessionStorage.getItem('session')).toBe('data');
  });

  it('should clear all storage', () => {
    localStorage.setItem('a', '1');
    localStorage.clear();
    expect(localStorage.length).toBe(0);
  });
});
