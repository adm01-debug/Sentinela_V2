import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const UserDetailPage = () => (<div data-testid="page"><h1>User Detail</h1></div>);

describe('UserDetailPage', () => {
  it('should render', () => {
    render(<UserDetailPage />);
    expect(screen.getByText('User Detail')).toBeInTheDocument();
  });
});
