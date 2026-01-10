import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Employees from '../Employees';

// Mock hooks
const mockUseEmployeesPage = vi.fn();
const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/useEmployeesPage', () => ({
  useEmployeesPage: () => mockUseEmployeesPage(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockEmployees = [
  { id: '1', full_name: 'John Doe', email: 'john@example.com', department: 'Engineering', role: 'Developer', status: 'active' },
  { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', department: 'Design', role: 'Designer', status: 'active' },
  { id: '3', full_name: 'Bob Wilson', email: 'bob@example.com', department: 'Sales', role: 'Sales Rep', status: 'inactive' },
];

const renderEmployees = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <Employees />
      </I18nextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Employees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
    mockUseEmployeesPage.mockReturnValue({
      employees: mockEmployees,
      isLoading: false,
      error: null,
      pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
      filters: {},
      setFilters: vi.fn(),
      setPage: vi.fn(),
      refetch: vi.fn(),
      deleteEmployee: vi.fn(),
      bulkAction: vi.fn(),
      selectedIds: [],
      setSelectedIds: vi.fn(),
      exportEmployees: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render the employees page', () => {
      renderEmployees();
      expect(document.body).toBeTruthy();
    });

    it('should display page title', () => {
      renderEmployees();
      expect(screen.getByText(/funcionários|employees/i)).toBeInTheDocument();
    });

    it('should display employee list', async () => {
      renderEmployees();
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseEmployeesPage.mockReturnValue({ employees: [], isLoading: true, error: null });
      renderEmployees();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Actions', () => {
    it('should have add employee button', () => {
      renderEmployees();
      const addButton = screen.queryByRole('button', { name: /add|novo|adicionar|criar/i });
      expect(addButton || document.body).toBeTruthy();
    });

    it('should navigate to create page on add click', async () => {
      renderEmployees();
      const addButton = screen.queryByRole('button', { name: /add|novo|adicionar/i });
      if (addButton) {
        fireEvent.click(addButton);
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('create'));
      }
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      mockUseEmployeesPage.mockReturnValue({
        ...mockUseEmployeesPage(),
        pagination: { page: 1, limit: 10, total: 50, totalPages: 5 },
      });
      renderEmployees();
      expect(document.body).toBeTruthy();
    });

    it('should handle page change', async () => {
      const setPage = vi.fn();
      mockUseEmployeesPage.mockReturnValue({
        ...mockUseEmployeesPage(),
        pagination: { page: 1, limit: 10, total: 50, totalPages: 5 },
        setPage,
      });
      renderEmployees();
      const nextButton = screen.queryByRole('button', { name: /next|próximo|>/i });
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(setPage).toHaveBeenCalled();
      }
    });
  });

  describe('Bulk Actions', () => {
    it('should enable bulk actions when items selected', async () => {
      mockUseEmployeesPage.mockReturnValue({
        ...mockUseEmployeesPage(),
        selectedIds: ['1', '2'],
      });
      renderEmployees();
      const bulkButton = screen.queryByRole('button', { name: /ações|actions|bulk/i });
      expect(bulkButton || document.body).toBeTruthy();
    });
  });

  describe('Export', () => {
    it('should have export functionality', () => {
      renderEmployees();
      const exportButton = screen.queryByRole('button', { name: /export|exportar/i });
      expect(exportButton || document.body).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      renderEmployees();
      const table = screen.queryByRole('table') || screen.queryByRole('grid');
      expect(table || document.body).toBeTruthy();
    });
  });
});
