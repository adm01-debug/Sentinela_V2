import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuspiciousActivityCard } from '../SuspiciousActivityCard';
describe('SuspiciousActivityCard', () => {
  const activity = { id: '1', type: 'unusual_login', severity: 'high', timestamp: '2026-01-01T10:00:00Z', details: 'Login from new location' };
  it('renders', () => { render(<SuspiciousActivityCard activity={activity} />); expect(screen.getByText('unusual_login')).toBeInTheDocument(); });
  it('shows severity', () => { render(<SuspiciousActivityCard activity={activity} />); expect(screen.getByText('high')).toBeInTheDocument(); });
  it('shows details', () => { render(<SuspiciousActivityCard activity={activity} />); expect(screen.getByText('Login from new location')).toBeInTheDocument(); });
  it('handles investigate', () => { const onInvestigate = vi.fn(); render(<SuspiciousActivityCard activity={activity} onInvestigate={onInvestigate} />); fireEvent.click(screen.getByText(/investigate/i)); expect(onInvestigate).toHaveBeenCalled(); });
});