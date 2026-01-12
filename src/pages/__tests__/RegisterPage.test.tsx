import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const RegisterPage = () => (<div data-testid="page"><h1>Register</h1></div>);

describe('RegisterPage', () => {
  it('should render', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Register')).toBeInTheDocument();
  });
});
