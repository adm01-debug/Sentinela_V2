import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessageTemplatesPage } from '../useMessageTemplatesPage';

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

describe('useMessageTemplatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMessageTemplatesPage(), { wrapper });
    
    expect(result.current.searchTerm).toBe('');
    expect(result.current.categoryFilter).toBe('all');
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('should have template categories', () => {
    const { result } = renderHook(() => useMessageTemplatesPage(), { wrapper });
    
    expect(result.current.TEMPLATE_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('should have template variables', () => {
    const { result } = renderHook(() => useMessageTemplatesPage(), { wrapper });
    
    expect(result.current.TEMPLATE_VARIABLES.length).toBeGreaterThan(0);
  });

  it('should get preview content with replaced variables', () => {
    const { result } = renderHook(() => useMessageTemplatesPage(), { wrapper });
    
    const preview = result.current.getPreviewContent('Hello {{employee_name}}');
    expect(preview).not.toContain('{{employee_name}}');
  });
});
