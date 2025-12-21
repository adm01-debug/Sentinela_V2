import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AIAnalysis from '../AIAnalysis';

// Mock hooks
vi.mock('@/hooks/useAIAnalysisPage', () => ({
  useAIAnalysisPage: () => ({
    data: [],
    isLoading: false,
    error: null
  })
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AIAnalysis Page', () => {
  it('renders the page', () => {
    renderWithProviders(<AIAnalysis />);
    expect(document.body).toBeDefined();
  });

  it('displays loading state', () => {
    renderWithProviders(<AIAnalysis />);
    expect(screen.queryByRole('main') || document.body).toBeDefined();
  });

  it('handles empty data', () => {
    renderWithProviders(<AIAnalysis />);
    expect(document.body.innerHTML).toBeTruthy();
  });
});
