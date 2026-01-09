import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePermission } from '../usePermission';

describe('usePermission', () => {
  it('should query permission', async () => {
    navigator.permissions = { query: vi.fn().mockResolvedValue({ state: 'granted', addEventListener: vi.fn() }) } as any;
    const { result } = renderHook(() => usePermission('geolocation'));
    await waitFor(() => expect(result.current).toBe('granted'));
  });
});