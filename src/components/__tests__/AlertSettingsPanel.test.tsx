import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertSettingsPanel } from '../AlertSettingsPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useAlertSettings hook since component uses internal hook
vi.mock('@/hooks/useAlertSettings', () => ({
  useAlertSettings: () => ({
    settings: {
      enabled: true,
      notify_critical: true,
      notify_high: true,
      notify_medium: false,
      notify_low: false,
      recipient_emails: ['test@example.com'],
    },
    loading: false,
    updateSettings: vi.fn(),
    addEmail: vi.fn(),
    removeEmail: vi.fn(),
    testNotification: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('AlertSettingsPanel', () => {
  // AlertSettingsPanel takes no props - it uses internal hook
  it('renders settings panel', () => {
    render(<AlertSettingsPanel />, { wrapper });
    expect(screen.getByText('Alertas por Email')).toBeInTheDocument();
  });

  it('shows severity toggles', () => {
    render(<AlertSettingsPanel />, { wrapper });
    expect(screen.getByText('Crítica')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('displays recipient emails', () => {
    render(<AlertSettingsPanel />, { wrapper });
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('has test notification button', () => {
    render(<AlertSettingsPanel />, { wrapper });
    expect(screen.getByText('Enviar Teste')).toBeInTheDocument();
  });
});
