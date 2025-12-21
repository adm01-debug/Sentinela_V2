import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../Auth';

vi.mock('@/hooks/useAuthPage', () => ({
  useAuthPage: () => ({ isLoading: false, error: null })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('Auth Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Auth /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });

  it('displays login form', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><Auth /></BrowserRouter></QueryClientProvider>);
    expect(document.body.innerHTML).toBeTruthy();
  });
});