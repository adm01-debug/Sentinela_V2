import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useInstallPage } from '../useInstallPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('useInstallPage', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should initialize with step 1', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    expect(result.current.step).toBe(1);
  });

  it('should provide nextStep function', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    expect(typeof result.current.nextStep).toBe('function');
  });

  it('should provide prevStep function', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    expect(typeof result.current.prevStep).toBe('function');
  });

  it('should increment step on nextStep', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.step).toBe(2);
  });

  it('should not go below step 1 on prevStep', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.step).toBe(1);
  });

  it('should provide generateKey function', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    expect(typeof result.current.generateKey).toBe('function');
  });

  it('should provide copyToClipboard function', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    expect(typeof result.current.copyToClipboard).toBe('function');
  });

  it('should initialize copied as false', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    expect(result.current.copied).toBe(false);
  });

  it('should return agentKeys array', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    expect(Array.isArray(result.current.agentKeys)).toBe(true);
  });

  it('should track loading state', () => {
    const { result } = renderHook(() => useInstallPage(), { wrapper });
    expect(result.current.isLoading).toBeDefined();
  });
});
