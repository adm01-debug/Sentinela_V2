import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../DashboardPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

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
      averageProductivity: 80,
      alertsCount: 5,
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

// Mock components that use internal hooks or cause side effects
vi.mock('@/components/DashboardCustomizer', () => ({
  DashboardCustomizer: () => <div data-testid="dashboard-customizer" />,
}));

vi.mock('@/components/PageTransition', () => ({
  PageTransition: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/WelcomeBanner', () => ({
  WelcomeBanner: () => <div data-testid="welcome-banner" />,
}));

// Mock DashboardCharts to avoid Recharts errors
vi.mock('../dashboard/DashboardCharts', () => ({
  DashboardChartsRow: () => <div data-testid="charts-row" />,
  DepartmentPieChart: () => <div data-testid="pie-chart" />,
}));

// Mock DashboardCards
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
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('toggles filters visibility', () => {
    renderDashboard();

    const filterButton = screen.getByRole('button', { name: /Filtros/i });
    
    expect(screen.queryByPlaceholderText('Departamento')).not.toBeInTheDocument();

    fireEvent.click(filterButton);

    expect(screen.getByPlaceholderText('Departamento')).toBeInTheDocument();
  });

  it('changes period when buttons are clicked', () => {
    renderDashboard();

    const monthButton = screen.getByRole('button', { name: /Mês/i });
    
    fireEvent.click(monthButton);
    expect(monthButton).toHaveClass('bg-primary');
  });
});
