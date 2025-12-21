import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import InternetAccess from '../InternetAccess';

vi.mock('@/hooks/useInternetAccessPage', () => ({
  useInternetAccessPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('InternetAccess Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><InternetAccess /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});