import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import DashboardPage from '../DashboardPage';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useDashboard', () => ({
  useDashboardStats: () => ({
    data: {
      totalEmployees: 100,
      activeEmployees: 50,
      averageProductivity: 87,
      alertsCount: 3,
    },
    isLoading: false,
  }),
  useRecentAlerts: () => ({ data: [], isLoading: false }),
  useRecentActivity: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useChartColors', () => ({
  useChartColors: () => ({
    primary: '#000',
    accent: '#111',
    success: '#222',
    info: '#333',
    warning: '#444',
    destructive: '#555',
  }),
}));

vi.mock('@/components/StatCard', () => ({
  StatCard: ({ title, value }: { title?: React.ReactNode; value?: React.ReactNode }) => (
    <div data-testid="stat-card">
      <div data-testid="stat-title">{title}</div>
      <div data-testid="stat-value">{value}</div>
    </div>
  ),
  StatCardsGrid: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/DashboardCustomizer', () => ({
  DashboardCustomizer: () => <div data-testid="dashboard-customizer" />,
}));

vi.mock('@/components/PageTransition', () => ({
  PageTransition: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/WelcomeBanner', () => ({
  WelcomeBanner: () => <div data-testid="welcome-banner" />,
}));

vi.mock('../dashboard/DashboardCharts', () => ({
  DashboardChartsRow: () => <div data-testid="charts-row" />,
  DepartmentPieChart: () => <div data-testid="pie-chart" />,
}));

vi.mock('../dashboard/DashboardCards', () => ({
  DashboardAlertsCard: () => <div data-testid="alerts-card" />,
  DashboardActivityCard: () => <div data-testid="activity-card" />,
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders stats cards correctly', () => {
    renderDashboard();

    expect(screen.getByText('dashboard.title')).toBeInTheDocument();
    
    const titles = screen.getAllByTestId('stat-title');
    expect(titles.some(t => t.textContent === 'dashboard.totalEmployees')).toBe(true);
    
    const values = screen.getAllByTestId('stat-value');
    expect(values.some(v => v.textContent === '100')).toBe(true);
    expect(values.some(v => v.textContent === '50')).toBe(true);
    expect(values.some(v => v.textContent === '87%')).toBe(true);
    expect(values.some(v => v.textContent === '3')).toBe(true);
  });

  it('toggles filters visibility', () => {
    renderDashboard();

    const filterButton = screen.getByRole('button', { name: /Filtros/i });
    
    // Select component trigger text "Todos os departamentos" should not be present initially
    expect(screen.queryByText('Todos os departamentos')).not.toBeInTheDocument();

    fireEvent.click(filterButton);

    // Now it should be visible
    expect(screen.getByText('Todos os departamentos')).toBeInTheDocument();
  });

  it('changes period when buttons are clicked', () => {
    renderDashboard();

    const monthButton = screen.getByRole('button', { name: /Mês/i });
    
    fireEvent.click(monthButton);
    expect(monthButton).toHaveClass('bg-primary');
  });
});
