import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Install from '../Install';

vi.mock('@/hooks/useInstallPage', () => ({
  useInstallPage: () => ({ data: null, isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Install Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Install /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});