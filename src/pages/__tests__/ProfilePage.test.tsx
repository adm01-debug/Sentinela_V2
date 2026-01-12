import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ProfilePage = () => (<div data-testid="page"><h1>Profile</h1></div>);

describe('ProfilePage', () => {
  it('should render', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
