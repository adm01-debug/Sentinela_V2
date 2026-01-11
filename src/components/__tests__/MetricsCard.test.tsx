import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsCard } from '../MetricsCard';
describe('MetricsCard', () => {
  it('renders metric', () => { render(<MetricsCard title="Total Users" value={1500} />); expect(screen.getByText('Total Users')).toBeInTheDocument(); expect(screen.getByText('1,500')).toBeInTheDocument(); });
  it('shows trend', () => { render(<MetricsCard title="Users" value={100} trend={5.5} />); expect(screen.getByText('+5.5%')).toBeInTheDocument(); });
  it('shows negative trend', () => { render(<MetricsCard title="Users" value={100} trend={-3.2} />); expect(screen.getByText('-3.2%')).toHaveClass('text-red'); });
  it('shows loading', () => { render(<MetricsCard title="Users" value={0} loading />); expect(screen.getByTestId('skeleton')).toBeInTheDocument(); });
});