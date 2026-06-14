import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import MonitoringPage from '../MonitoringPage';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockEmployees = [
  { id: '1', name: 'John Doe', department: 'Engineering', status: 'online', productivity_score: 90, last_activity: new Date().toISOString(), email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', department: 'Marketing', status: 'offline', productivity_score: 85, last_activity: new Date().toISOString(), email: 'jane@example.com' },
];

vi.mock('@/hooks/useMonitoringPage', () => ({
  useMonitoringPage: () => ({
    selectedEmployee: null,
    viewMode: 'grid',
    setViewMode: vi.fn(),
    statusFilter: 'all',
    setStatusFilter: vi.fn(),
    departmentFilter: 'all',
    setDepartmentFilter: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn(),
    autoRefresh: true,
    setAutoRefresh: vi.fn(),
    employees: mockEmployees,
    departments: ['Engineering', 'Marketing'],
    activitySummary: null,
    stats: { total: 2, online: 1, idle: 0, busy: 0, offline: 1 },
    isLoadingEmployees: false,
    handleSelectEmployee: vi.fn(),
  }),
}));

vi.mock('@/hooks/useChartColors', () => ({
  useChartColors: () => ({
    primary: '#000',
    accent: '#111',
    success: '#222',
    info: '#333',
    warning: '#444',
    destructive: '#555',
    muted: '#666',
    border: '#777',
  }),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  BarChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('MonitoringPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderMonitoring = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MonitoringPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderMonitoring();
    expect(screen.getByText('Monitoramento em Tempo Real')).toBeInTheDocument();
  });

  it('renders stats', () => {
    renderMonitoring();
    expect(screen.getByText('2')).toBeInTheDocument(); // total
  });

  it('renders employee grid', () => {
    renderMonitoring();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders charts', () => {
    renderMonitoring();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});
