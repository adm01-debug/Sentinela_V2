import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionManager } from '../SessionManager';
describe('SessionManager', () => {
  const sessions = [{ id: '1', device: 'Chrome', location: 'Brazil', lastActive: '5m ago', current: true }];
  it('renders sessions', () => { render(<SessionManager sessions={sessions} onRevoke={vi.fn()} />); expect(screen.getByText('Chrome')).toBeInTheDocument(); });
  it('shows current badge', () => { render(<SessionManager sessions={sessions} onRevoke={vi.fn()} />); expect(screen.getByText(/current/i)).toBeInTheDocument(); });
  it('revokes session', () => { const onRevoke = vi.fn(); render(<SessionManager sessions={[{ ...sessions[0], current: false }]} onRevoke={onRevoke} />); fireEvent.click(screen.getByRole('button', { name: /revoke/i })); expect(onRevoke).toHaveBeenCalled(); });
});