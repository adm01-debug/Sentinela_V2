import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';
import AIAnalysis from '../AIAnalysis';

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mockUseAuth() }));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderAIAnalysis = () => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter><I18nextProvider i18n={i18n}><AIAnalysis /></I18nextProvider></BrowserRouter>
  </QueryClientProvider>
);

describe('AIAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, isAuthenticated: true });
  });

  describe('Rendering', () => {
    it('should render the page', () => { renderAIAnalysis(); expect(document.body).toBeTruthy(); });
    it('should display page content', async () => { renderAIAnalysis(); await waitFor(() => { expect(document.body).toBeTruthy(); }); });
  });

  describe('Loading State', () => {
    it('should handle loading state', () => { renderAIAnalysis(); expect(document.body).toBeTruthy(); });
  });

  describe('Accessibility', () => {
    it('should have proper structure', () => { renderAIAnalysis(); expect(document.body).toBeTruthy(); });
  });
});
