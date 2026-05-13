import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../DashboardPage';
import { BrowserRouter } from 'react-router-dom';

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

// Mock ResizeObserver which might be used by charts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stats cards correctly', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText('dashboard.title')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // totalEmployees
    expect(screen.getByText('50')).toBeInTheDocument(); // activeEmployees
    expect(screen.getByText('80%')).toBeInTheDocument(); // averageProductivity
    expect(screen.getByText('5')).toBeInTheDocument(); // alertsCount
  });

  it('toggles filters visibility', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    const filterButton = screen.getByRole('button', { name: /Filtros/i });
    
    // Initially filters should not be visible
    expect(screen.queryByPlaceholderText('Departamento')).not.toBeInTheDocument();

    fireEvent.click(filterButton);

    // Now filters should be visible
    expect(screen.getByPlaceholderText('Departamento')).toBeInTheDocument();
  });

  it('changes period when buttons are clicked', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    const weekButton = screen.getByRole('button', { name: /Semana/i });
    const monthButton = screen.getByRole('button', { name: /Mês/i });

    // Week is default (primary button has different classes usually, but we check if it responds to clicks)
    fireEvent.click(monthButton);
    expect(monthButton).toHaveClass('bg-primary'); // Default variant for selected period
  });
});
