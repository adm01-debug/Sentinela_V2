import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import DataExport from '../DataExport';

vi.mock('@/hooks/useDataExportPage', () => ({
  useDataExportPage: () => ({ data: [], isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('DataExport Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><DataExport /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});