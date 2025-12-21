import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';

vi.mock('@/hooks/useDashboardPage', () => ({
  useDashboardPage: () => ({ data: [], isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Index Page', () => {
  it('renders the dashboard', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Index /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});