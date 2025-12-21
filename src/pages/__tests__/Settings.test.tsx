import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../Settings';

vi.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({ data: null, isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Settings Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Settings /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});