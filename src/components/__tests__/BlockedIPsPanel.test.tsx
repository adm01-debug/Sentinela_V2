import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlockedIPsPanel } from '../BlockedIPsPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useBlockedIPs hook since component uses internal hook
vi.mock('@/hooks/useBlockedIPs', () => ({
  useBlockedIPs: () => ({
    activeBlocks: [
      {
        id: '1',
        ip_address: '192.168.1.1',
        reason: 'Suspicious',
        endpoint: null,
        blocked_at: '2026-01-01T10:00:00Z',
        expires_at: null,
        is_active: true,
      },
    ],
    inactiveBlocks: [],
    isLoading: false,
    blockIP: vi.fn(),
    unblockIP: vi.fn(),
    deleteBlock: vi.fn(),
    isBlocking: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('BlockedIPsPanel', () => {
  // BlockedIPsPanel takes no props - uses internal hook
  it('renders blocked IPs panel', () => {
    render(<BlockedIPsPanel />, { wrapper });
    expect(screen.getByText('IPs Bloqueados')).toBeInTheDocument();
  });

  it('shows blocked IP address', () => {
    render(<BlockedIPsPanel />, { wrapper });
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('displays block reason', () => {
    render(<BlockedIPsPanel />, { wrapper });
    expect(screen.getByText('Suspicious')).toBeInTheDocument();
  });

  it('has add block button', () => {
    render(<BlockedIPsPanel />, { wrapper });
    expect(screen.getByText('Bloquear IP')).toBeInTheDocument();
  });
});
