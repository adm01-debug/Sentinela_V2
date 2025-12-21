import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Employees from '../Employees';

vi.mock('@/hooks/useEmployeesPage', () => ({
  useEmployeesPage: () => ({ data: [], isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Employees Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Employees /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});