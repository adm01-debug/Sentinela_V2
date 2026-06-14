import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { EmployeesPage } from '../EmployeesPage';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useEmployeesPage', () => ({
  useEmployeesPage: () => ({
    filteredEmployees: [
      { id: '1', name: 'Employee One', department: 'IT', status: 'active' },
    ],
    teams: [{ id: '1', name: 'Team Alpha' }],
    stats: { total: 1, active: 1, inactive: 0 },
    loading: false,
    filters: { search: '', status: 'all', team: 'all' },
    setSearchTerm: vi.fn(),
    setStatusFilter: vi.fn(),
    setTeamFilter: vi.fn(),
    clearFilters: vi.fn(),
    openEditDialog: vi.fn(),
    openDeleteDialog: vi.fn(),
    openDeviceDialog: vi.fn(),
    handleUnassignDevice: vi.fn(),
  }),
}));

vi.mock('@/hooks/useChartColors', () => ({
  useChartColors: () => ({
    success: '#000',
    muted: '#111',
    warning: '#222',
    destructive: '#333',
    border: '#444',
    primary: '#555',
  }),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
}));

vi.mock('@/components/PageTransition', () => ({
  PageTransition: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/employees/EmployeeStatsCards', () => ({
  EmployeeStatsCards: () => <div data-testid="stats-cards" />,
}));

vi.mock('@/components/employees/EmployeeFilters', () => ({
  EmployeeFilters: () => <div data-testid="employee-filters" />,
}));

vi.mock('@/components/employees/EmployeeTable', () => ({
  EmployeeTable: () => <div data-testid="employee-table" />,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderEmployees = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EmployeesPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderEmployees();
    expect(screen.getByText('employees.title')).toBeInTheDocument();
    expect(screen.getByText('employees.addEmployee')).toBeInTheDocument();
    expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('employee-filters')).toBeInTheDocument();
    expect(screen.getByTestId('employee-table')).toBeInTheDocument();
  });

  it('navigates to create page on button click', () => {
    renderEmployees();
    const addButton = screen.getByText('employees.addEmployee');
    fireEvent.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith('/employees/new');
  });
});
