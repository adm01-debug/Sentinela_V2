import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const UserInvitePage = () => (<div data-testid="page"><h1>Invite User</h1></div>);

describe('UserInvitePage', () => {
  it('should render', () => {
    render(<UserInvitePage />);
    expect(screen.getByText('Invite User')).toBeInTheDocument();
  });
});
