import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation', () => {
  it('should request geolocation', async () => {
    const mockPosition = { coords: { latitude: 40.7, longitude: -74 } };
    navigator.geolocation = { getCurrentPosition: vi.fn((cb) => cb(mockPosition)), watchPosition: vi.fn() } as any;
    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.latitude).toBe(40.7));
  });

  it('should handle error', async () => {
    navigator.geolocation = { getCurrentPosition: vi.fn((_, err) => err(new Error('denied'))), watchPosition: vi.fn() } as any;
    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.error).toBeDefined());
  });
});