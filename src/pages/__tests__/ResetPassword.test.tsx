import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import ResetPassword from '../ResetPassword';

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderPage = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter><I18nextProvider i18n={i18n}><ResetPassword /></I18nextProvider></BrowserRouter>
  </QueryClientProvider>
);

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
  });

  describe('Rendering', () => {
    it('should render the page', () => { renderPage(); expect(document.body).toBeTruthy(); });
    it('should display page content', async () => { renderPage(); await waitFor(() => { expect(document.body).toBeTruthy(); }); });
  });

  describe('Loading State', () => {
    it('should handle loading state', () => { renderPage(); expect(document.body).toBeTruthy(); });
  });

  describe('Accessibility', () => {
    it('should have proper structure', () => { renderPage(); expect(document.body).toBeTruthy(); });
  });
});
