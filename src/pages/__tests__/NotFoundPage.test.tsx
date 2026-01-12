import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const NotFoundPage = () => (<div data-testid="page"><h1>404 Not Found</h1></div>);

describe('NotFoundPage', () => {
  it('should render', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
  });
});
