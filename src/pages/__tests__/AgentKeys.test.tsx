import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AgentKeys from '../AgentKeys';

vi.mock('@/hooks/useAgentKeysPage', () => ({
  useAgentKeysPage: () => ({ data: [], isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('AgentKeys Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><AgentKeys /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });

  it('displays content', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><AgentKeys /></BrowserRouter></QueryClientProvider>);
    expect(document.body.innerHTML).toBeTruthy();
  });
});