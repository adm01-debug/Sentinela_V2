import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';
describe('StatCard', () => {
  it('renders value', () => { render(<StatCard title="Users" value={1500} />); expect(screen.getByText('1,500')).toBeInTheDocument(); });
  it('shows title', () => { render(<StatCard title="Users" value={100} />); expect(screen.getByText('Users')).toBeInTheDocument(); });
  it('shows icon', () => { render(<StatCard title="Users" value={100} icon="users" />); expect(screen.getByTestId('icon-users')).toBeInTheDocument(); });
  it('shows trend', () => { render(<StatCard title="Users" value={100} trend={5} />); expect(screen.getByText('+5%')).toBeInTheDocument(); });
});