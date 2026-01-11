import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecurityAuditLog } from '../SecurityAuditLog';
describe('SecurityAuditLog', () => {
  const logs = [{ id: '1', action: 'login', user: 'John', timestamp: '2026-01-01T10:00:00Z', ip: '192.168.1.1' }];
  it('renders logs', () => { render(<SecurityAuditLog logs={logs} />); expect(screen.getByText('login')).toBeInTheDocument(); });
  it('shows user', () => { render(<SecurityAuditLog logs={logs} />); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('shows IP', () => { render(<SecurityAuditLog logs={logs} />); expect(screen.getByText('192.168.1.1')).toBeInTheDocument(); });
  it('empty state', () => { render(<SecurityAuditLog logs={[]} />); expect(screen.getByText(/no logs/i)).toBeInTheDocument(); });
});