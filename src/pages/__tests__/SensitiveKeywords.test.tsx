import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import SensitiveKeywords from '../SensitiveKeywords';

vi.mock('@/hooks/useSensitiveKeywordsPage', () => ({
  useSensitiveKeywordsPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('SensitiveKeywords Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><SensitiveKeywords /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});