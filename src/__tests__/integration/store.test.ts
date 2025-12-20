import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

describe('Store Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should initialize query client', () => {
    expect(queryClient).toBeDefined();
  });

  it('should handle query invalidation', async () => {
    queryClient.setQueryData(['test'], { data: 'initial' });
    expect(queryClient.getQueryData(['test'])).toEqual({ data: 'initial' });
    
    await queryClient.invalidateQueries({ queryKey: ['test'] });
  });

  it('should handle query prefetching', async () => {
    await queryClient.prefetchQuery({
      queryKey: ['prefetch-test'],
      queryFn: async () => ({ data: 'prefetched' }),
    });

    expect(queryClient.getQueryData(['prefetch-test'])).toEqual({ data: 'prefetched' });
  });

  it('should handle query removal', () => {
    queryClient.setQueryData(['remove-test'], { data: 'to-remove' });
    queryClient.removeQueries({ queryKey: ['remove-test'] });
    expect(queryClient.getQueryData(['remove-test'])).toBeUndefined();
  });
});
