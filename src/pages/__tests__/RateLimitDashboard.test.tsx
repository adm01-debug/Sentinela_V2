import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import RateLimitDashboard from '../RateLimitDashboard';

vi.mock('@/hooks/useRateLimitDashboardPage', () => ({
  useRateLimitDashboardPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('RateLimitDashboard Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><RateLimitDashboard /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});