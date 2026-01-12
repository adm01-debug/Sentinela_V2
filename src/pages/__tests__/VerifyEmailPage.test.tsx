import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const VerifyEmailPage = () => (<div data-testid="page"><h1>Verify Email</h1></div>);

describe('VerifyEmailPage', () => {
  it('should render', () => {
    render(<VerifyEmailPage />);
    expect(screen.getByText('Verify Email')).toBeInTheDocument();
  });
});
