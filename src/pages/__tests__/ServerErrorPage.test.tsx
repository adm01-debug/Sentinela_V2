import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ServerErrorPage = () => (<div data-testid="page"><h1>500 Server Error</h1></div>);

describe('ServerErrorPage', () => {
  it('should render', () => {
    render(<ServerErrorPage />);
    expect(screen.getByText('500 Server Error')).toBeInTheDocument();
  });
});
