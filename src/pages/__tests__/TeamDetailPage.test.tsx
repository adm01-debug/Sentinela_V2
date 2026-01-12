import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const TeamDetailPage = () => (<div data-testid="page"><h1>Team Detail</h1></div>);

describe('TeamDetailPage', () => {
  it('should render', () => {
    render(<TeamDetailPage />);
    expect(screen.getByText('Team Detail')).toBeInTheDocument();
  });
});
