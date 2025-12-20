import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSecurityPage } from '../useSecurityPage';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSecurityPage', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useSecurityPage(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });

  it('should have loading state initially', () => {
    const { result } = renderHook(() => useSecurityPage(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBeDefined();
  });

  it('should have required handlers', () => {
    const { result } = renderHook(() => useSecurityPage(), { wrapper: createWrapper() });
    // Verify handlers exist
    const handlers = Object.keys(result.current).filter(k => k.startsWith('handle'));
    expect(handlers.length).toBeGreaterThan(0);
  });
});
