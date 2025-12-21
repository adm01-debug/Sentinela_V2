import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Reports from '../Reports';

vi.mock('@/hooks/useReportsPage', () => ({
  useReportsPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Reports Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Reports /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});