import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApplicationCard } from '../ApplicationCard';
import type { ApplicationUsage } from '@/data/employeeDetailData';

describe('ApplicationCard', () => {
  // ApplicationCard expects 'application' prop with ApplicationUsage type
  const mockApp: ApplicationUsage = {
    id: '1',
    name: 'Chrome',
    icon: '🌐',
    category: 'productive',
    duration: 120, // minutes
    lastUsed: 'há 5 min',
  };

  it('renders app name', () => {
    render(<ApplicationCard application={mockApp} />);
    expect(screen.getByText('Chrome')).toBeInTheDocument();
  });

  it('shows usage time', () => {
    render(<ApplicationCard application={mockApp} />);
    // Duration 120 min = 2h 0m
    expect(screen.getByText(/2h 0m/)).toBeInTheDocument();
  });

  it('displays icon', () => {
    render(<ApplicationCard application={mockApp} />);
    expect(screen.getByText('🌐')).toBeInTheDocument();
  });

  it('shows category label', () => {
    render(<ApplicationCard application={mockApp} />);
    expect(screen.getByText('Produtivo')).toBeInTheDocument();
  });

  it('handles unproductive category', () => {
    const unproductiveApp: ApplicationUsage = {
      ...mockApp,
      category: 'unproductive',
    };
    render(<ApplicationCard application={unproductiveApp} />);
    expect(screen.getByText('Improdutivo')).toBeInTheDocument();
  });
});
