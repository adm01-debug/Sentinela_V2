import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { DevicesPage } from '../DevicesPage';
import * as useDevicesPageHook from '@/hooks/useDevicesPage';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useDevicesPage', () => ({
  useDevicesPage: vi.fn(),
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
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
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

describe('DevicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useDevicesPageHook.useDevicesPage).mockReturnValue({
      devices: [
        { id: '1', name: 'Work Laptop', device_type: 'desktop', is_active: true, os_name: 'Windows', ip_address: '192.168.1.1' },
      ],
      stats: { total: 1, active: 1, desktop: 1, mobile: 0 },
      filters: { search: '', type: 'all', status: 'all' },
      isLoading: false,
      isRefreshing: false,
      handleRefresh: vi.fn(),
      handleFilterChange: vi.fn(),
      handleViewDetails: vi.fn(),
      isDetailsOpen: false,
      selectedDevice: null,
    } as any);
  });

  const renderDevices = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DevicesPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderDevices();
    expect(screen.getByText('Dispositivos')).toBeInTheDocument();
    expect(screen.getByText('Work Laptop')).toBeInTheDocument();
  });

  it('renders stats and charts', () => {
    renderDevices();
    expect(screen.getByText('Total')).toBeInTheDocument();
    // We can have multiple pie charts, so getAllByTestId
    const pieCharts = screen.getAllByTestId('pie-chart');
    expect(pieCharts.length).toBeGreaterThan(0);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('calls handleRefresh on button click', () => {
    const { handleRefresh } = useDevicesPageHook.useDevicesPage();
    renderDevices();
    const refreshButton = screen.getByText('Atualizar');
    fireEvent.click(refreshButton);
    expect(handleRefresh).toHaveBeenCalled();
  });
});
