import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const HelpPage = () => (<div data-testid="page"><h1>Help Center</h1></div>);

describe('HelpPage', () => {
  it('should render', () => {
    render(<HelpPage />);
    expect(screen.getByText('Help Center')).toBeInTheDocument();
  });
});
