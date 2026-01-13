import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAppConfig } from '../useAppConfig';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

describe('useAppConfig', () => {
  it('should initialize with default config when no data', async () => {
    const { result } = renderHook(() => useAppConfig());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.config).toBeDefined();
  });

  it('should have maintenanceMode in config', async () => {
    const { result } = renderHook(() => useAppConfig());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.config?.maintenanceMode).toBe(false);
  });

  it('should have updateConfig function', async () => {
    const { result } = renderHook(() => useAppConfig());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.updateConfig).toBe('function');
  });

  it('should have refresh function', async () => {
    const { result } = renderHook(() => useAppConfig());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.refresh).toBe('function');
  });
});
