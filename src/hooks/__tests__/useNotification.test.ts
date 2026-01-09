import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useNotification } from '../useNotification';

describe('useNotification', () => {
  it('should check permission', () => {
    const { result } = renderHook(() => useNotification());
    expect(result.current.permission).toBeDefined();
  });

  it('should request permission', async () => {
    global.Notification = { requestPermission: vi.fn().mockResolvedValue('granted') } as any;
    const { result } = renderHook(() => useNotification());
    await act(async () => { await result.current.requestPermission(); });
  });
});