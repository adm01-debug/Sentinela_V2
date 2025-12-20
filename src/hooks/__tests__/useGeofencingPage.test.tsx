import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGeofencingPage, GEOFENCE_COLORS } from '../useGeofencingPage';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useGeofencingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have geofence colors', () => {
    expect(GEOFENCE_COLORS.length).toBeGreaterThan(0);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useGeofencingPage(), { wrapper });
    
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.selectedGeofence).toBeNull();
    expect(result.current.isDrawing).toBe(false);
  });

  it('should open create dialog', () => {
    const { result } = renderHook(() => useGeofencingPage(), { wrapper });
    
    act(() => {
      result.current.handleOpenCreate();
    });
    
    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.editingGeofence).toBeNull();
  });
});
