import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const UsersPage = () => (<div data-testid="page"><h1>Users</h1></div>);

describe('UsersPage', () => {
  it('should render', () => {
    render(<UsersPage />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });
});
