import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ScheduledReports from '../ScheduledReports';

vi.mock('@/hooks/useScheduledReportsPage', () => ({
  useScheduledReportsPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('ScheduledReports Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><ScheduledReports /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});