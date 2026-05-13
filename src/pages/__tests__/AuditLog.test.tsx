import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditLogPage } from '../AuditLogPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocks
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('AuditLogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuditLog = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuditLogPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly after loading', async () => {
    renderAuditLog();
    
    // Wait for content to appear
    await waitFor(() => {
        expect(screen.queryByText('Logs de Auditoria')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Buscar por tipo, detalhe ou IP...')).toBeInTheDocument();
  });

  it('shows empty state when no events', async () => {
    renderAuditLog();
    // Wait for content to appear
    await waitFor(() => {
        expect(screen.queryByText('Nenhum evento encontrado.')).toBeInTheDocument();
    });
  });
});
