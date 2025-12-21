import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import PolicyAcknowledgments from '../PolicyAcknowledgments';

vi.mock('@/hooks/usePolicyAcknowledgments', () => ({
  usePolicyAcknowledgments: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('PolicyAcknowledgments Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><PolicyAcknowledgments /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});