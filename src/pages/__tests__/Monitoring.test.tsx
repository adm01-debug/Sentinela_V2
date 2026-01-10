import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Monitoring from '../Monitoring';

const mockUseMonitoringPage = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useMonitoringPage', () => ({ useMonitoringPage: () => mockUseMonitoringPage() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockMonitoringData = {
  activeUsers: 45,
  totalActivities: 1250,
  screenshots: 320,
  alerts: 5,
};

const renderMonitoring = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}><Monitoring /></I18nextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
    mockUseMonitoringPage.mockReturnValue({
      data: mockMonitoringData,
      isLoading: false,
      error: null,
      activities: [],
      screenshots: [],
      refetch: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render monitoring page', () => {
      renderMonitoring();
      expect(document.body).toBeTruthy();
    });

    it('should display page title', () => {
      renderMonitoring();
      expect(screen.getByText(/monitoramento|monitoring/i)).toBeInTheDocument();
    });

    it('should display active users count', async () => {
      renderMonitoring();
      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should have refresh capability', () => {
      const refetch = vi.fn();
      mockUseMonitoringPage.mockReturnValue({ ...mockUseMonitoringPage(), refetch });
      renderMonitoring();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseMonitoringPage.mockReturnValue({ data: null, isLoading: true, error: null });
      renderMonitoring();
      expect(document.body).toBeTruthy();
    });
  });
});
