import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertItem } from '../AlertItem';
import type { Alert } from '@/data/mockData';

describe('AlertItem', () => {
  const mockAlert: Alert = { 
    id: '1', 
    employeeId: 'emp1',
    employeeName: 'John Doe',
    type: 'usb_blocked',
    severity: 'critical', 
    message: 'USB device blocked',
    device: 'DESKTOP-01',
    timestamp: '2026-01-01T10:00:00Z' 
  };

  it('renders alert info', () => {
    render(<AlertItem alert={mockAlert} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows correct severity badge', () => {
    render(<AlertItem alert={mockAlert} />);
    expect(screen.getByText('CRÍTICO')).toBeInTheDocument();
  });

  it('displays alert message', () => {
    render(<AlertItem alert={mockAlert} />);
    expect(screen.getByText('USB device blocked')).toBeInTheDocument();
  });

  it('shows device info', () => {
    render(<AlertItem alert={mockAlert} />);
    expect(screen.getByText(/DESKTOP-01/)).toBeInTheDocument();
  });
});
