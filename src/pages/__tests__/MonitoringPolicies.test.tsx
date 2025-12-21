import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import MonitoringPolicies from '../MonitoringPolicies';

vi.mock('@/hooks/useMonitoringPoliciesPage', () => ({
  useMonitoringPoliciesPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('MonitoringPolicies Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><MonitoringPolicies /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});