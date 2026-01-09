import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIndexedDB } from '../useIndexedDB';

describe('useIndexedDB', () => {
  it('should return db operations', () => {
    const { result } = renderHook(() => useIndexedDB('testDB'));
    expect(typeof result.current.get).toBe('function');
    expect(typeof result.current.set).toBe('function');
    expect(typeof result.current.remove).toBe('function');
  });
});