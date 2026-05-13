import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivitiesPage from '../ActivitiesPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useActivities', () => ({
  useActivities: () => ({ data: [], isLoading: false }),
  useActivitySummary: () => ({ data: {}, isLoading: false }),
}));

vi.mock('@/components/ActivityFilters', () => ({
  ActivityFilters: () => <div data-testid="activity-filters" />,
}));

vi.mock('@/components/ActivityChart', () => ({
  ActivityChart: () => <div data-testid="activity-chart" />,
}));

vi.mock('@/components/ActivityTable', () => ({
  ActivityTable: () => <div data-testid="activity-table" />,
}));

vi.mock('@/components/ApplicationBreakdown', () => ({
  ApplicationBreakdown: () => <div data-testid="app-breakdown" />,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ActivitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderActivities = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ActivitiesPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderActivities();
    expect(screen.getByText('nav.activities')).toBeInTheDocument();
    expect(screen.getByTestId('activity-filters')).toBeInTheDocument();
    expect(screen.getByTestId('activity-chart')).toBeInTheDocument();
    expect(screen.getByTestId('app-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('activity-table')).toBeInTheDocument();
  });
});
