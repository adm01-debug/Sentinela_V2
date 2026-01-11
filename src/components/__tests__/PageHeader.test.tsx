import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';
describe('PageHeader', () => {
  it('renders title', () => { render(<PageHeader title="Dashboard" />); expect(screen.getByText('Dashboard')).toBeInTheDocument(); });
  it('renders subtitle', () => { render(<PageHeader title="Dashboard" subtitle="Overview" />); expect(screen.getByText('Overview')).toBeInTheDocument(); });
  it('renders actions', () => { render(<PageHeader title="Test" actions={<button>Action</button>} />); expect(screen.getByText('Action')).toBeInTheDocument(); });
});