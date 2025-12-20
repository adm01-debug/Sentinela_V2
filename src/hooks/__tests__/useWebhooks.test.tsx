import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebhooks, useWebhook, useWebhookLogs } from '../useWebhooks';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useWebhooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch webhooks list', async () => {
    const { result } = renderHook(() => useWebhooks(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('useWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useWebhook(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should fetch when id is provided', async () => {
    const { result } = renderHook(() => useWebhook('webhook-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('useWebhookLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when webhookId is undefined', () => {
    const { result } = renderHook(() => useWebhookLogs(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should fetch logs when webhookId is provided', async () => {
    const { result } = renderHook(() => useWebhookLogs('webhook-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
