import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Geofencing from '../Geofencing';

vi.mock('@/hooks/useGeofencingPage', () => ({
  useGeofencingPage: () => ({ data: [], isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Geofencing Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Geofencing /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});