import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { useEmployeeDetailPage } from '../useEmployeeDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/employees/123']}>
      <Routes>
        <Route path="/employees/:id" element={children} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

describe('useEmployeeDetailPage', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useEmployeeDetailPage(), { wrapper });
    expect(result.current.isLoading).toBeDefined();
  });

  it('should return employeeId from params', () => {
    const { result } = renderHook(() => useEmployeeDetailPage(), { wrapper });
    expect(result.current.employeeId).toBe('123');
  });

  it('should provide updateEmployee function', () => {
    const { result } = renderHook(() => useEmployeeDetailPage(), { wrapper });
    expect(typeof result.current.updateEmployee).toBe('function');
  });

  it('should provide refetch function', () => {
    const { result } = renderHook(() => useEmployeeDetailPage(), { wrapper });
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should return activities array', () => {
    const { result } = renderHook(() => useEmployeeDetailPage(), { wrapper });
    expect(Array.isArray(result.current.activities)).toBe(true);
  });

  it('should return violations array', () => {
    const { result } = renderHook(() => useEmployeeDetailPage(), { wrapper });
    expect(Array.isArray(result.current.violations)).toBe(true);
  });

  it('should handle error state', () => {
    const { result } = renderHook(() => useEmployeeDetailPage(), { wrapper });
    expect(result.current.error).toBeDefined();
  });

  it('should track updating state', () => {
    const { result } = renderHook(() => useEmployeeDetailPage(), { wrapper });
    expect(result.current.isUpdating).toBe(false);
  });
});
