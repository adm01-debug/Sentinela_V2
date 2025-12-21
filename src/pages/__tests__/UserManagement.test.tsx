import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from '../UserManagement';

vi.mock('@/hooks/useUserManagementPage', () => ({
  useUserManagementPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('UserManagement Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><UserManagement /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});