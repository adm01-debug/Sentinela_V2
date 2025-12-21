import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ProductivityComparison from '../ProductivityComparison';

vi.mock('@/hooks/useProductivityComparison', () => ({
  useProductivityComparison: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('ProductivityComparison Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><ProductivityComparison /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});