import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmployeeStats } from '../EmployeeStats';
describe('EmployeeStats', () => {
  const stats = { totalHours: 160, productivity: 85, violations: 2, avgResponseTime: 1.5 };
  it('renders stats', () => { render(<EmployeeStats stats={stats} />); expect(screen.getByText('160h')).toBeInTheDocument(); });
  it('shows productivity', () => { render(<EmployeeStats stats={stats} />); expect(screen.getByText('85%')).toBeInTheDocument(); });
  it('shows violations count', () => { render(<EmployeeStats stats={stats} />); expect(screen.getByText('2')).toBeInTheDocument(); });
  it('handles loading', () => { render(<EmployeeStats stats={stats} loading />); expect(screen.getAllByTestId('skeleton')).toHaveLength(4); });
});