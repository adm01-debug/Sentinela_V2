import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Monitoring from '../Monitoring';

vi.mock('@/hooks/useMonitoringPage', () => ({
  useMonitoringPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Monitoring Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Monitoring /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});