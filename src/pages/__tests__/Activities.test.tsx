import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ActivitiesPage from '../ActivitiesPage';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useActivities', () => ({
  useActivities: () => ({ data: [], isLoading: false }),
}));

let summaryState: { summary: unknown; isLoading: boolean; error: Error | null } = {
  summary: null,
  isLoading: false,
  error: null,
};

vi.mock('@/hooks/useActivitySummary', () => ({
  useActivitySummary: () => summaryState,
}));

vi.mock('@/components/ActivityFilters', () => ({
  ActivityFilters: () => <div data-testid="activity-filters" />,
}));

vi.mock('@/components/ActivityChart', () => ({
  ActivityChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="activity-chart" data-count={data.length} />
  ),
}));

vi.mock('@/components/ActivityTable', () => ({
  ActivityTable: () => <div data-testid="activity-table" />,
}));

vi.mock('@/components/ApplicationBreakdown', () => ({
  ApplicationBreakdown: ({ data }: { data: unknown[] }) => (
    <div data-testid="app-breakdown" data-count={data.length} />
  ),
}));

vi.mock('@/components/AnomalyDetectionPanel', () => ({
  AnomalyDetectionPanel: () => <div data-testid="anomaly-panel" />,
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
    summaryState = { summary: null, isLoading: false, error: null };
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

  it('leva a distribuicao horaria e os aplicativos do resumo para os graficos', () => {
    summaryState = {
      summary: {
        hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({ hour, count: hour })),
        topApplications: [
          { name: 'Chrome', count: 60, percentage: 60 },
          { name: 'Slack', count: 40, percentage: 40 },
        ],
      },
      isLoading: false,
      error: null,
    };

    renderActivities();

    expect(screen.getByTestId('activity-chart')).toHaveAttribute('data-count', '24');
    expect(screen.getByTestId('app-breakdown')).toHaveAttribute('data-count', '2');
  });
});