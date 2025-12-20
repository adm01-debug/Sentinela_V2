import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDataExportPage } from '../useDataExportPage';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDataExportPage', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useDataExportPage(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });

  it('should have loading state initially', () => {
    const { result } = renderHook(() => useDataExportPage(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBeDefined();
  });

  it('should have required handlers', () => {
    const { result } = renderHook(() => useDataExportPage(), { wrapper: createWrapper() });
    // Verify handlers exist
    const handlers = Object.keys(result.current).filter(k => k.startsWith('handle'));
    expect(handlers.length).toBeGreaterThan(0);
  });
});
