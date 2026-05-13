import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportsPage from '../ReportsPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocks
vi.mock('@/hooks/useReports', () => ({
  useReports: () => ({
    data: {
      data: [
        { id: '1', name: 'Annual Sales', status: 'completed' },
        { id: '2', name: 'Monthly Performance', status: 'pending' },
      ],
    },
    isLoading: false,
  }),
  useReportTemplates: () => ({
    data: [],
    isLoading: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderReports = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ReportsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderReports();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Annual Sales')).toBeInTheDocument();
    expect(screen.getByText('Monthly Performance')).toBeInTheDocument();
  });

  it('shows empty state when no reports', () => {
    vi.mocked(require('@/hooks/useReports').useReports).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });
    renderReports();
    expect(screen.queryByText('Annual Sales')).not.toBeInTheDocument();
  });
});
