import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useViolationRulesPage, RULE_TYPES, RULE_ACTIONS } from '../useViolationRulesPage';

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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useViolationRulesPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have rule types defined', () => {
    expect(RULE_TYPES.length).toBeGreaterThan(0);
    expect(RULE_TYPES.some(t => t.value === 'app')).toBe(true);
  });

  it('should have rule actions defined', () => {
    expect(RULE_ACTIONS.length).toBeGreaterThan(0);
    expect(RULE_ACTIONS.some(a => a.value === 'alert')).toBe(true);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useViolationRulesPage(), { wrapper });
    expect(result.current.searchTerm).toBe('');
    expect(result.current.typeFilter).toBe('all');
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('should open create dialog', () => {
    const { result } = renderHook(() => useViolationRulesPage(), { wrapper });
    act(() => { result.current.handleOpenCreate(); });
    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.editingRule).toBeNull();
  });
});
