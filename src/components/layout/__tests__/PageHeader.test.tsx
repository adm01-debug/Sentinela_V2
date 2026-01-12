import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<PageHeader title="Settings" description="Manage your account" />);
    expect(screen.getByText('Manage your account')).toBeInTheDocument();
  });

  it('should render actions', () => {
    render(<PageHeader title="Users" actions={<button>Add User</button>} />);
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });
});
