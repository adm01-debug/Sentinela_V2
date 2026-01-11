import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertItem } from '../AlertItem';

describe('AlertItem', () => {
  const mockAlert = { id: '1', title: 'High CPU', severity: 'critical', timestamp: '2026-01-01T10:00:00Z' };
  it('renders alert info', () => {
    render(<AlertItem alert={mockAlert} />);
    expect(screen.getByText('High CPU')).toBeInTheDocument();
  });
  it('shows correct severity badge', () => {
    render(<AlertItem alert={mockAlert} />);
    expect(screen.getByText('critical')).toHaveClass('badge-critical');
  });
  it('handles dismiss action', () => {
    const onDismiss = vi.fn();
    render(<AlertItem alert={mockAlert} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledWith('1');
  });
  it('expands details on click', () => {
    render(<AlertItem alert={{ ...mockAlert, details: 'More info' }} />);
    fireEvent.click(screen.getByText('High CPU'));
    expect(screen.getByText('More info')).toBeInTheDocument();
  });
});