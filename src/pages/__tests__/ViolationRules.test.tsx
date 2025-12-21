import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ViolationRules from '../ViolationRules';

vi.mock('@/hooks/useViolationRulesPage', () => ({
  useViolationRulesPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('ViolationRules Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><ViolationRules /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});