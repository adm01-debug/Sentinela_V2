import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockedIPsPanel } from '../BlockedIPsPanel';
describe('BlockedIPsPanel', () => {
  const ips = [{ ip: '192.168.1.1', reason: 'Suspicious', blockedAt: '2026-01-01' }];
  it('renders blocked IPs', () => { render(<BlockedIPsPanel ips={ips} />); expect(screen.getByText('192.168.1.1')).toBeInTheDocument(); });
  it('shows block reason', () => { render(<BlockedIPsPanel ips={ips} />); expect(screen.getByText('Suspicious')).toBeInTheDocument(); });
  it('handles unblock', () => { const onUnblock = vi.fn(); render(<BlockedIPsPanel ips={ips} onUnblock={onUnblock} />); fireEvent.click(screen.getByRole('button', { name: /unblock/i })); expect(onUnblock).toHaveBeenCalled(); });
  it('shows empty state', () => { render(<BlockedIPsPanel ips={[]} />); expect(screen.getByText(/no blocked/i)).toBeInTheDocument(); });
});