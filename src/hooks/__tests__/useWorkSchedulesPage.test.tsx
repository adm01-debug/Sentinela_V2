import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkSchedulesPage } from '../useWorkSchedulesPage';

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

describe('useWorkSchedulesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWorkSchedulesPage(), { wrapper });
    
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.editingSchedule).toBeNull();
  });

  it('should open create dialog', () => {
    const { result } = renderHook(() => useWorkSchedulesPage(), { wrapper });
    
    act(() => {
      result.current.handleOpenCreate();
    });
    
    expect(result.current.isDialogOpen).toBe(true);
  });

  it('should have default form data', () => {
    const { result } = renderHook(() => useWorkSchedulesPage(), { wrapper });
    
    expect(result.current.formData.name).toBe('');
    expect(result.current.formData.is_active).toBe(true);
  });
});
