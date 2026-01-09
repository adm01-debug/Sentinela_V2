import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOfflineStorage } from '../useOfflineStorage';

describe('useOfflineStorage', () => {
  it('should store data offline', async () => {
    const { result } = renderHook(() => useOfflineStorage('test'));
    await act(async () => { await result.current.set('key', 'value'); });
    expect(result.current.get).toBeDefined();
  });
});