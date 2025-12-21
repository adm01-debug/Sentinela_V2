import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Teams from '../Teams';

vi.mock('@/hooks/useTeamsPage', () => ({
  useTeamsPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Teams Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Teams /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});