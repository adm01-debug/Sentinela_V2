import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../pages/LoginPage';

vi.mock('@/hooks', () => ({ useLogin: () => ({ mutate: vi.fn(), isPending: false, error: null }) }));

describe('LoginPage', () => {
  const Wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient()}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>;
  
  it('renders login form', () => { render(<LoginPage />, { wrapper: Wrapper }); expect(screen.getByLabelText(/email/i)).toBeInTheDocument(); expect(screen.getByLabelText(/password/i)).toBeInTheDocument(); });
  it('has submit button', () => { render(<LoginPage />, { wrapper: Wrapper }); expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument(); });
});