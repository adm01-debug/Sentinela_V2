import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Users" value={100} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should show positive change', () => {
    render(<StatCard title="Revenue" value="$10k" change={15} />);
    expect(screen.getByText(/15%/)).toBeInTheDocument();
  });

  it('should show negative change', () => {
    render(<StatCard title="Errors" value={5} change={-10} />);
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });
});
