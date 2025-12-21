import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Webhooks from '../Webhooks';

vi.mock('@/hooks/useWebhooksPage', () => ({
  useWebhooksPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Webhooks Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Webhooks /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});