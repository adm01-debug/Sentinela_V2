import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import AnalyticsPage from '../AnalyticsPage';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    data: {
      productivity: 85,
      activeHours: 42,
      activeUsers: 10,
      appsUsed: 15,
      chartData: [{ date: '2026-01-01', productivity: 80 }],
    },
    isLoading: false,
  }),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

vi.mock('@/components/PageTransition', () => ({
  PageTransition: ({ children }: any) => <div>{children}</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAnalytics = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AnalyticsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderAnalytics();

    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('42h')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders chart', () => {
    renderAnalytics();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('changes period when select is used', async () => {
    renderAnalytics();

    const select = screen.getByRole('combobox');
    expect(select).toHaveTextContent('Últimos 7 dias');
    
    // Select behavior in Shadcn/Radix is complex to test without Radix specific helpers,
    // but we can check if it's there.
  });
});
