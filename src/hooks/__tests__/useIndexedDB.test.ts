import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useIndexedDB } from '../useIndexedDB';

describe('useIndexedDB', () => {
  it('should open database', async () => {
    const mockDB = { transaction: vi.fn(), objectStoreNames: { contains: vi.fn() } };
    global.indexedDB = { open: vi.fn().mockReturnValue({ result: mockDB, onsuccess: null }) } as any;
    const { result } = renderHook(() => useIndexedDB('testDB'));
    expect(result.current).toBeDefined();
  });
});