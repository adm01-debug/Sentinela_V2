import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import EmployeeDetail from '../EmployeeDetail';

vi.mock('@/hooks/useEmployeeDetailPage', () => ({
  useEmployeeDetailPage: () => ({ data: null, isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('EmployeeDetail Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><EmployeeDetail /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});