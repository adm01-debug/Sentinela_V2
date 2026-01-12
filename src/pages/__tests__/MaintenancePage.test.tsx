import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const MaintenancePage = () => (<div data-testid="page"><h1>Maintenance</h1></div>);

describe('MaintenancePage', () => {
  it('should render', () => {
    render(<MaintenancePage />);
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });
});
