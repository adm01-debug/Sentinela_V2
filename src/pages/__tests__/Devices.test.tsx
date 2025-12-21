import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Devices from '../Devices';

vi.mock('@/hooks/useDevicesPage', () => ({
  useDevicesPage: () => ({ data: [], isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Devices Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Devices /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});