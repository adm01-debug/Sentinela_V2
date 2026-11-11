import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ViolationsPage } from '../ViolationsPage';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockViolations = [
  { id: '1', employee_name: 'John Doe', severity: 'critical', violation_type: 'usb_blocked', status: 'open', created_at: new Date().toISOString(), description: 'USB access attempted' },
];

const mockHandleOpenResolve = vi.fn();

vi.mock('@/hooks/useViolationsPage', () => ({
  useViolationsPage: () => ({
    searchTerm: '',
    setSearchTerm: vi.fn(),
    severityFilter: 'all',
    setSeverityFilter: vi.fn(),
    statusFilter: 'all',
    setStatusFilter: vi.fn(),
    typeFilter: 'all',
    setTypeFilter: vi.fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: vi.fn(),
    isResolveOpen: false,
    setIsResolveOpen: vi.fn(),
    selectedViolation: null,
    resolutionNotes: '',
    setResolutionNotes: vi.fn(),
    violations: mockViolations,
    allViolations: mockViolations,
    stats: { total: 1, open: 1, investigating: 0, resolved: 0, bySeverity: { critical: 1, high: 0, medium: 0, low: 0 } },
    isLoading: false,
    isResolving: false,
    handleViewDetails: vi.fn(),
    handleOpenResolve: mockHandleOpenResolve,
    handleResolve: vi.fn(),
    VIOLATION_TYPES: [{ value: 'usb_blocked', label: 'USB Bloqueado' }],
  }),
}));

vi.mock('@/hooks/useChartColors', () => ({
  useChartColors: () => ({
    destructive: '#000',
    warning: '#111',
    info: '#222',
    primary: '#333',
    border: '#444',
    muted: '#555',
  }),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ViolationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderViolations = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ViolationsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderViolations();
    expect(screen.getByText('Violações de Segurança')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders charts', () => {
    renderViolations();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('opens resolve dialog on button click', () => {
    renderViolations();
    const resolveButton = screen.getByText('Resolver');
    fireEvent.click(resolveButton);
    expect(mockHandleOpenResolve).toHaveBeenCalled();
  });
});
