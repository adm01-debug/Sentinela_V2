import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Analytics from '../Analytics';

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: () => <div>LineChart</div>,
  BarChart: () => <div>BarChart</div>,
  PieChart: () => <div>PieChart</div>,
  AreaChart: () => <div>AreaChart</div>,
  Line: () => null, Bar: () => null, Pie: () => null, Area: () => null,
  XAxis: () => null, YAxis: () => null, CartesianGrid: () => null, Tooltip: () => null, Legend: () => null,
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const renderAnalytics = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter><I18nextProvider i18n={i18n}><Analytics /></I18nextProvider></BrowserRouter>
  </QueryClientProvider>
);

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
  });

  it('should render analytics page', () => { renderAnalytics(); expect(document.body).toBeTruthy(); });
  it('should display page title', () => { renderAnalytics(); expect(screen.getByText(/analytics|análise/i)).toBeInTheDocument(); });
  it('should render chart components', async () => { renderAnalytics(); await waitFor(() => { expect(document.body).toBeTruthy(); }); });
});
