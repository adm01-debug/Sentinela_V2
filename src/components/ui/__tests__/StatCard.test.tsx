import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Users" value={150} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatCard title="Users" value={100} subtitle="Active users" />);
    expect(screen.getByText('Active users')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<StatCard title="Users" value={100} icon={Users} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('shows positive trend', () => {
    render(<StatCard title="Users" value={100} trend={{ value: 15, isPositive: true }} />);
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('shows negative trend', () => {
    render(<StatCard title="Users" value={100} trend={{ value: -10, isPositive: false }} />);
    expect(screen.getByText('-10%')).toBeInTheDocument();
  });
});
