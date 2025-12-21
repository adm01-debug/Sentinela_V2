import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import MobileMonitoring from '../MobileMonitoring';

vi.mock('@/hooks/useMobileMonitoringPage', () => ({
  useMobileMonitoringPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('MobileMonitoring Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><MobileMonitoring /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});