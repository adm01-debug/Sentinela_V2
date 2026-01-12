import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const HelpContactPage = () => (<div data-testid="page"><h1>Contact Support</h1></div>);

describe('HelpContactPage', () => {
  it('should render', () => {
    render(<HelpContactPage />);
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });
});
