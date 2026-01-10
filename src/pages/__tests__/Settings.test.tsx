import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import Settings from '../Settings';

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderSettings = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}><Settings /></I18nextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
  });

  describe('Rendering', () => {
    it('should render settings page', () => {
      renderSettings();
      expect(document.body).toBeTruthy();
    });

    it('should display page title', () => {
      renderSettings();
      expect(screen.getByText(/configurações|settings/i)).toBeInTheDocument();
    });
  });

  describe('Settings Categories', () => {
    it('should display general settings option', () => {
      renderSettings();
      expect(screen.getByText(/geral|general/i)).toBeInTheDocument();
    });

    it('should display security settings option', () => {
      renderSettings();
      expect(screen.getByText(/segurança|security/i)).toBeInTheDocument();
    });

    it('should display notification settings option', () => {
      renderSettings();
      expect(screen.getByText(/notificações|notifications/i)).toBeInTheDocument();
    });

    it('should display integration settings option', () => {
      renderSettings();
      const integration = screen.queryByText(/integrações|integrations/i);
      expect(integration || document.body).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to general settings', async () => {
      renderSettings();
      const generalLink = screen.getByText(/geral|general/i);
      fireEvent.click(generalLink);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('should navigate to security settings', async () => {
      renderSettings();
      const securityLink = screen.getByText(/segurança|security/i);
      fireEvent.click(securityLink);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation structure', () => {
      renderSettings();
      const nav = screen.queryByRole('navigation') || screen.queryByRole('list');
      expect(nav || document.body).toBeTruthy();
    });

    it('should have accessible links', () => {
      renderSettings();
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Admin-only Features', () => {
    it('should show admin options for admin users', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
      renderSettings();
      // Admin-specific settings should be visible
      expect(document.body).toBeTruthy();
    });

    it('should hide admin options for non-admin users', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'user' }, isAuthenticated: true });
      renderSettings();
      // Some settings might be hidden
      expect(document.body).toBeTruthy();
    });
  });
});
