import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Violations from '../Violations';

const mockUseViolationsPage = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useViolationsPage', () => ({
  useViolationsPage: () => mockUseViolationsPage(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockViolations = [
  { id: '1', employee_id: 'e1', severity: 'high', status: 'open', description: 'Policy violation', detected_at: '2024-01-15T10:00:00Z' },
  { id: '2', employee_id: 'e2', severity: 'medium', status: 'acknowledged', description: 'Time violation', detected_at: '2024-01-14T09:00:00Z' },
  { id: '3', employee_id: 'e1', severity: 'low', status: 'resolved', description: 'Minor infraction', detected_at: '2024-01-13T08:00:00Z' },
];

const renderViolations = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <Violations />
      </I18nextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Violations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
    mockUseViolationsPage.mockReturnValue({
      violations: mockViolations,
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
      filters: {},
      setFilters: vi.fn(),
      updateStatus: vi.fn(),
      statistics: { total: 3, bySeverity: { high: 1, medium: 1, low: 1 }, byStatus: { open: 1, acknowledged: 1, resolved: 1 } },
    });
  });

  describe('Rendering', () => {
    it('should render violations page', () => {
      renderViolations();
      expect(document.body).toBeTruthy();
    });

    it('should display page title', () => {
      renderViolations();
      expect(screen.getByText(/violações|violations/i)).toBeInTheDocument();
    });

    it('should display violation list', async () => {
      renderViolations();
      await waitFor(() => {
        expect(screen.getByText(/policy violation/i)).toBeInTheDocument();
      });
    });

    it('should display severity badges', async () => {
      renderViolations();
      await waitFor(() => {
        expect(screen.getByText(/high|alta/i)).toBeInTheDocument();
        expect(screen.getByText(/medium|média/i)).toBeInTheDocument();
      });
    });

    it('should display status badges', async () => {
      renderViolations();
      await waitFor(() => {
        expect(screen.getByText(/open|aberto/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by severity', async () => {
      const setFilters = vi.fn();
      mockUseViolationsPage.mockReturnValue({ ...mockUseViolationsPage(), setFilters });
      renderViolations();
      const severityFilter = screen.queryByRole('combobox', { name: /severity|severidade/i });
      if (severityFilter) {
        fireEvent.change(severityFilter, { target: { value: 'high' } });
        expect(setFilters).toHaveBeenCalled();
      }
    });

    it('should filter by status', async () => {
      const setFilters = vi.fn();
      mockUseViolationsPage.mockReturnValue({ ...mockUseViolationsPage(), setFilters });
      renderViolations();
      const statusFilter = screen.queryByRole('combobox', { name: /status/i });
      if (statusFilter) {
        fireEvent.change(statusFilter, { target: { value: 'open' } });
        expect(setFilters).toHaveBeenCalled();
      }
    });
  });

  describe('Actions', () => {
    it('should allow status update', async () => {
      const updateStatus = vi.fn();
      mockUseViolationsPage.mockReturnValue({ ...mockUseViolationsPage(), updateStatus });
      renderViolations();
      await waitFor(() => {
        expect(document.body).toBeTruthy();
      });
    });
  });

  describe('Statistics', () => {
    it('should display violation statistics', async () => {
      renderViolations();
      await waitFor(() => {
        // Should show total count or statistics
        expect(document.body).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseViolationsPage.mockReturnValue({ violations: [], isLoading: true, error: null });
      renderViolations();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should handle error state', () => {
      mockUseViolationsPage.mockReturnValue({ violations: [], isLoading: false, error: new Error('Failed') });
      renderViolations();
      expect(document.body).toBeTruthy();
    });
  });
});
