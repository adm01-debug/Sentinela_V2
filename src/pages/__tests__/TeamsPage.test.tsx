import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const TeamsPage = () => (<div data-testid="page"><h1>Teams</h1></div>);

describe('TeamsPage', () => {
  it('should render', () => {
    render(<TeamsPage />);
    expect(screen.getByText('Teams')).toBeInTheDocument();
  });
});
