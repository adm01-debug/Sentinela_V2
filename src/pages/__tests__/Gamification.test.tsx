import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Gamification from '../Gamification';

vi.mock('@/hooks/useGamificationPage', () => ({
  useGamificationPage: () => ({ data: [], isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Gamification Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Gamification /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});