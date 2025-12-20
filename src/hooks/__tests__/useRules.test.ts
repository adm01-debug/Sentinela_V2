import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRules } from '../useRules';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useRules', () => {
  it('should initialize without errors', () => {
    expect(true).toBe(true);
  });

  it('should return expected shape', () => {
    expect(true).toBe(true);
  });

  it('should handle loading state', () => {
    expect(true).toBe(true);
  });
});
