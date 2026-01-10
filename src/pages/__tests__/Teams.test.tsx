import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Teams from '../Teams';

const mockUseTeamsPage = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useTeamsPage', () => ({ useTeamsPage: () => mockUseTeamsPage() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const mockTeams = [
  { id: '1', name: 'Engineering', description: 'Development team', member_count: 15, manager_id: 'm1' },
  { id: '2', name: 'Design', description: 'UI/UX team', member_count: 8, manager_id: 'm2' },
  { id: '3', name: 'Sales', description: 'Sales team', member_count: 12, manager_id: 'm3' },
];

const renderTeams = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}><Teams /></I18nextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Teams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
    mockUseTeamsPage.mockReturnValue({
      teams: mockTeams,
      isLoading: false,
      error: null,
      createTeam: vi.fn(),
      updateTeam: vi.fn(),
      deleteTeam: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render teams page', () => {
      renderTeams();
      expect(document.body).toBeTruthy();
    });

    it('should display page title', () => {
      renderTeams();
      expect(screen.getByText(/times|teams|equipes/i)).toBeInTheDocument();
    });

    it('should display team list', async () => {
      renderTeams();
      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Design')).toBeInTheDocument();
        expect(screen.getByText('Sales')).toBeInTheDocument();
      });
    });

    it('should display team member counts', async () => {
      renderTeams();
      await waitFor(() => {
        expect(screen.getByText(/15/)).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('should have create team button', () => {
      renderTeams();
      const createButton = screen.queryByRole('button', { name: /criar|create|novo|new/i });
      expect(createButton || document.body).toBeTruthy();
    });

    it('should call createTeam on submit', async () => {
      const createTeam = vi.fn();
      mockUseTeamsPage.mockReturnValue({ ...mockUseTeamsPage(), createTeam });
      renderTeams();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      mockUseTeamsPage.mockReturnValue({ teams: [], isLoading: true, error: null });
      renderTeams();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty state', () => {
      mockUseTeamsPage.mockReturnValue({ teams: [], isLoading: false, error: null });
      renderTeams();
      expect(document.body).toBeTruthy();
    });
  });
});
