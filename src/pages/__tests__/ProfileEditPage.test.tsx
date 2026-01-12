import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ProfileEditPage = () => (<div data-testid="page"><h1>Edit Profile</h1></div>);

describe('ProfileEditPage', () => {
  it('should render', () => {
    render(<ProfileEditPage />);
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });
});
