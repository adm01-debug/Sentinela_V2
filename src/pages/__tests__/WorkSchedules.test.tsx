import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import WorkSchedules from '../WorkSchedules';

vi.mock('@/hooks/useWorkSchedulesPage', () => ({
  useWorkSchedulesPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('WorkSchedules Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><WorkSchedules /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});